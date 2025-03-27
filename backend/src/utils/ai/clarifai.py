import os
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

    Args:
        image_path (str): Caminho para a imagem local.

    Returns:
        list[str]: Lista de ingredientes identificados.
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
    ingredients = [concept.name for concept in output.data.concepts]

    return ingredients