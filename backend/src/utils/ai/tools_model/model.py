from src.utils.ai.tools_model.prompts import search_recieves_prompt, extract_recieved_prompt
from src.utils.ai.tools_model.schemas import RecieveBase, RecieveResult, ReportState, RecieveList
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langgraph.graph import START, END, StateGraph
from langgraph.types import Send
from tavily import TavilyClient
from pytube import Search
from typing import List

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
        builder = StateGraph(ReportState)

        # Nodes
        builder.add_node("build_recieve", self.build_recieve)
        builder.add_node("single_recieve", self.single_recieve)
        builder.add_node("return_recieve", self.return_recieve)

        # Edges
        builder.add_edge(START, "build_recieve")
        builder.add_conditional_edges(
            "build_recieve", self.spaw_researchers, ["single_recieve"]
        )
        builder.add_edge("single_recieve", "return_recieve")
        builder.add_edge("return_recieve", END)
        
        self.graph = builder.compile()
        
    def find_recieves(self, ingredients : list[str])->List[RecieveResult]:
        results =  self.graph.invoke({"ingredients": ingredients})
        return [RecieveResult(**recipe) for recipe in results["recieves_results"]]
    
    def build_recieve(self, state : ReportState):
        
        prompt = search_recieves_prompt.format(ingredients=",".join(state.ingredients))
        query_llm = self.llm.with_structured_output(RecieveList)
        result = query_llm.invoke(prompt)

        return {"recieves_names" : list(result.recieves)}

    def spaw_researchers(self, state : ReportState):
        return [
            Send("single_recieve", recieve) for recieve in state.recieves_names
        ]

    def single_recieve(self, recieve : str):

        results = self.tavily.search(
            f"Receita de {recieve}", 
            max_results=10, include_raw_content=False
        )

        for result in results["results"]:
            url = result["url"]
            try:
                url_extraction = self.tavily.extract(url)
                raw_content = url_extraction["results"][0]["raw_content"]

                query_llm = self.llm.with_structured_output(RecieveBase)
                result = query_llm.invoke(extract_recieved_prompt.format(content=raw_content))
                
                if len(result.ingredients) == 0 or len(result.ingredients) == 0:
                    continue
                
                if len(result.videos) == 0:
                    result.videos = search_videos(recieve)
                
                recieve_result =  RecieveResult(title=recieve.capitalize(), url= url, **result.model_dump())

                return {"recieves_results" : [recieve_result.model_dump()]}
            except:
                continue
        
        return {"recieves_results" : []}
    
    def return_recieve(self, state : ReportState):
        return {"recieves" : state.recieves_results}