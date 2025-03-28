from src.utils.ai.tools_model.prompts import search_recieves_prompt, extract_recieved_prompt, get_recipe
from src.utils.ai.tools_model.schemas import RecieveBase, RecipeBase, RecipeBaseList, RecieveMedia, RecieveResult, ReportState, RecieveList
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langgraph.graph import START, END, StateGraph
from langgraph.types import Send
from tavily import TavilyClient
from pytube import Search
from typing import List
import warnings
warnings.filterwarnings("ignore")


from dotenv import load_dotenv
load_dotenv()

models_dict = {
    "gemini" : ChatGoogleGenerativeAI,
    "openai" : ChatOpenAI,
    "ollama" : ChatOllama,
}

def search_videos(recipe):
    search = Search(f"Receita de {recipe}")
    return [result.watch_url for result in search.results[:4]]

class ToolsModel:
    def __init__(self, model_name, model_type="gemini"):
        
        Model = models_dict.get(model_type)
        if Model is None:
            raise ValueError("Unsupported model type")
        
        self.llm = Model(model=model_name, temperature=0)
        
        self.tavily = TavilyClient()
        self.build_graphs()
        
    def generate_recipes(self, ingredients:list[str])->List[RecieveResult]:
        results =  self.generate_graph.invoke({"ingredients": ingredients})
        return [RecieveResult(**recipe) for recipe in results["recieves_results"]]
        
    def search_recipes(self, ingredients : list[str], verbose=False)->List[RecieveResult]:
        results =  self.search_graph.invoke({"ingredients": ingredients})
        return [RecieveResult(**recipe) for recipe in results["recieves_results"]]
    
    def build_graphs(self):
        search_builder = StateGraph(ReportState)

        # Search Mode
        # Nodes
        search_builder.add_node("build_recieve", self.build_recieve)
        search_builder.add_node("single_recieve", self.single_recieve)
        search_builder.add_node("return_recieve", self.return_recieve)

        # Edges
        search_builder.add_edge(START, "build_recieve")
        search_builder.add_conditional_edges(
            "build_recieve", self.spaw_researchers, ["single_recieve"]
        )
        search_builder.add_edge("single_recieve", "return_recieve")
        search_builder.add_edge("return_recieve", END)
        
        self.search_graph = search_builder.compile()

        # Generate Mode
        # Nodes
        generate_builder = StateGraph(ReportState)
        generate_builder.add_node("build_recieve", self.build_recieve)
        generate_builder.add_node("single_recipe_generate", self.single_recipe_generate)
        generate_builder.add_node("return_recieve", self.return_recieve)

        # Edges
        generate_builder.add_edge(START, "build_recieve")
        generate_builder.add_conditional_edges(
            "build_recieve", self.spaw_generators, ["single_recipe_generate"]
        )
        generate_builder.add_edge("single_recipe_generate", "return_recieve")
        generate_builder.add_edge("return_recieve", END)
        
        self.generate_graph = generate_builder.compile()
        
    
    def get_recipes(self, ingredients:list[str], verbose=False)->List[RecieveResult]:
        prompt = search_recieves_prompt.format(ingredients=",".join(ingredients))
        query_llm = self.llm.with_structured_output(RecieveList)
        result = query_llm.invoke(prompt)
        
        recipes = []
        
        for recipe_title in result.recieves:
            if verbose:
                print(recipe_title)
                
            prompt = get_recipe.format(recipe=recipe_title)
            query_llm = self.llm.with_structured_output(RecipeBase)
            recipe = query_llm.invoke(prompt)
            
            results = self.tavily.search(
                f"Receita de {recipe_title[:10]}", 
                max_results=10, include_raw_content=False, include_images=True
            )
            url = None
            
            for result in results["results"]:
                url = result["url"]
                break
            
            recipes.append(RecieveResult(
                **recipe.model_dump(),
                title=recipe_title,
                images = results["images"],
                videos = search_videos(recipe_title),
                url = url,  
            ))
        
        return recipes
    
    def build_recieve(self, state : ReportState):
        
        prompt = search_recieves_prompt.format(ingredients=",".join(state.ingredients))
        query_llm = self.llm.with_structured_output(RecieveList)
        result = query_llm.invoke(prompt)
        
        print("Receitas encontradas:", result.recieves)

        return {"recieves_names" : list(result.recieves)}

    def spaw_researchers(self, state : ReportState):
        return [
            Send("single_recieve", recieve) for recieve in state.recieves_names
        ]
    
    def spaw_generators(self, state : ReportState):
        return [
            Send("single_recipe_generate", recieve) for recieve in state.recieves_names
        ]
        

    def single_recieve(self, recieve : str):
        print("Buscando receita para:", recieve)
        results = self.tavily.search(
            f"Receita de {recieve}", 
            max_results=10, include_raw_content=False, include_images=True
        )

        for i, result in enumerate(results["results"]):
            url = result["url"]
            try:
                print(f"Extraindo conteúdo da página {i+1} de {len(results['results'])} da receita {recieve}")
                url_extraction = self.tavily.extract(url)
                raw_content = url_extraction["results"][0]["raw_content"]

                query_llm = self.llm.with_structured_output(RecieveBase)
                result = query_llm.invoke(extract_recieved_prompt.format(content=raw_content))
                
                if len(result.ingredients) == 0 or len(result.ingredients) == 0:
                    print(f"Não foi possível extrair os ingredientes da página {i+1} de {len(results['results'])} da receita {recieve}")
                    continue
                
                result.videos = search_videos(recieve)
                result.images = results["images"]
                
                recieve_result =  RecieveResult(title=recieve.capitalize(), url= url, **result.model_dump())
                
                print(f"Receita {recieve} encontrada: {recieve_result.title}")
                
                return {"recieves_results" : [recieve_result.model_dump()]}
            except:
                continue
        
        return {"recieves_results" : []}
    
    def single_recipe_generate(self, recipe_title:str):
        prompt = get_recipe.format(recipe=recipe_title)
        query_llm = self.llm.with_structured_output(RecipeBase)
        recipe = query_llm.invoke(prompt)
        
        results = self.tavily.search(
            f"Receita de {recipe_title[:20]}", 
            max_results=10, include_raw_content=False, include_images=True
        )
        url = None
        
        for result in results["results"]:
            url = result["url"]
            break
        
        recieve_result = RecieveResult(
                **recipe.model_dump(),
                title=recipe_title,
                images = results["images"],
                videos = search_videos(recipe_title),
                url = url,  
        )
        
        return {"recieves_results" : [recieve_result.model_dump()]}
    

    def generate_recipes_from_ingredients(self, ingredients: list[str]) -> List[RecieveResult]:
        """
        Generate recipes directly from a list of ingredients.
        """
        try:
            return self.get_recipes(ingredients)
        except Exception as e:
            raise ValueError(f"Error generating recipes: {str(e)}")

    def return_recieve(self, state : ReportState):
        return {"recieves" : state.recieves_results}