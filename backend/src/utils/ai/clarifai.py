import os
import requests
from dotenv import load_dotenv
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel
from clarifai_grpc.grpc.api import resources_pb2, service_pb2, service_pb2_grpc
from clarifai_grpc.grpc.api.status import status_code_pb2

# Carrega as variáveis de ambiente
load_dotenv()

# Configurações do Clarifai
PAT = os.getenv('CLARIFAI_PAT')
if not PAT:
    raise Exception("Por favor, defina a variável de ambiente CLARIFAI_PAT.")

USER_ID = 'clarifai'
APP_ID = 'main'
MODEL_ID = 'food-item-recognition'

# Inicializa o canal e o stub do Clarifai
channel = ClarifaiChannel.get_grpc_channel()
stub = service_pb2_grpc.V2Stub(channel)
metadata = (('authorization', 'Key ' + PAT),)

def get_ingredients_from_image(image_path: str) -> list[str]:
    """
    Processa uma imagem local para identificar ingredientes usando o modelo do Clarifai.
    Filtra apenas os ingredientes com probabilidade acima de 0.10 e retorna os 5 primeiros,
    mantendo a saída como uma lista de strings.
    
    Args:
        image_path (str): Caminho para a imagem local.
        
    Returns:
        list[str]: Lista dos 5 ingredientes (ou menos) com probabilidade > 0.10.
    """
    # Lê a imagem localmente
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

    # Cria e envia a requisição de previsão
    post_model_outputs_response = stub.PostModelOutputs(
        service_pb2.PostModelOutputsRequest(
            user_app_id=resources_pb2.UserAppIDSet(user_id=USER_ID, app_id=APP_ID),
            model_id=MODEL_ID,
            inputs=[
                resources_pb2.Input(
                    data=resources_pb2.Data(
                        image=resources_pb2.Image(base64=image_bytes)
                    )
                )
            ]
        ),
        metadata=metadata
    )

    # Verifica se a requisição foi bem-sucedida
    if post_model_outputs_response.status.code != status_code_pb2.SUCCESS:
        raise Exception("Erro ao obter resultados do modelo: " +
                        post_model_outputs_response.status.description)

    # Extrai os conceitos (ingredientes) da resposta
    output = post_model_outputs_response.outputs[0]
    # Filtra os conceitos com probabilidade > 0.05 e limita aos 8 primeiros
    filtered_concepts = [concept for concept in output.data.concepts if concept.value > 0.05][:8]
    # Retorna apenas os nomes dos ingredientes
    ingredients = [concept.name for concept in filtered_concepts]

    return ingredients

def download_image(url: str, filename: str = "temp_food.jpg") -> str:
    """
    Baixa uma imagem de uma URL e salva localmente.
    
    Args:
        url (str): URL da imagem.
        filename (str): Nome do arquivo local para salvar a imagem.
    
    Returns:
        str: Caminho para o arquivo salvo.
    """
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Erro ao baixar a imagem: {response.status_code}")
    
    with open(filename, "wb") as f:
        f.write(response.content)
    return filename

# Exemplo de uso com imagem de um link
if __name__ == "__main__":
    # URL de uma imagem de comida
    image_url = "https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
    
    try:
        # Baixa a imagem
        local_path = download_image(image_url)
        # Processa a imagem e obtém os ingredientes
        ingredientes = get_ingredients_from_image(local_path)
        print("Ingredientes detectados (com probabilidade > 0.05, top 3):")
        for ingrediente in ingredientes:
            print(f"- {ingrediente}")
        # Remove o arquivo temporário
        #os.remove(local_path)
    except Exception as e:
        print("Erro:", e)
