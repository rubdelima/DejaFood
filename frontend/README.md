## Como executar

Para executar, você primeiramente deve ter o [Ollama](https://ollama.com/) e alguns modelo com suporte a `tools`, em breve será construída uma versão via apenas API. É recomendados que você utilize o modelo Llama3.1-instruct. 

### Passos iniciais

1. **Instale o Ollama**  
   Você pode instalar o Ollama a partir deste [link](https://ollama.com/).

2. **Baixe os modelos necessários**  
   Após a instalação, você pode baixar alguns modelos executando os comandos abaixo no terminal:  
   ```sh
   ollama pull llama3.1:8b-instruct-q8_0
   ```

3. **Instale o Python**
   Verifique se sua máquina possui python, caso não possua você poderá baixar a partir do [Site Oficial](https://www.python.org/downloads/)

4. **Instale o Node**
   Verifique se sua máquina possui o `node`, caso não possua você poderá baixar a partir do [Site Oficial](https://nodejs.org/en/download)

### Preparando o ambiente

1. **Crie um ambiente virtual**  
   Para criar o ambiente virtual e organizar suas dependências, execute:
   ```sh
   python3 -m venv .rv
   ```

2. **Ative o ambiente virtual**  
   No Linux/MacOS:
   ```sh
   source .rv/bin/activate
   ```
   No Windows:
   ```sh
   .rv\Scripts\activate
   ```

3. **Instale as dependências do Python**  
   Com o ambiente virtual ativado, instale as dependências do python necessárias com:
   ```sh
   pip install -r requirements.txt
   ```

4. **Instale as Dependências do Node**
   Com o node instalado, você deverá baixar as dependências do projeto, para isso você deverá executar:
   ```sh
   npm install
   npm intall -g expo-cli
   ```

5. **Crie as variáveis locais de API**
   Crie um arquivo chamado `.env` para salvar as variáveis de ambiente, você irá precisar ter uma chave do Tavily para executar a busca na web. Você pode obter a chave pelo [site oficial](https://tavily.com/).
   Outra chave de API que você deverá possuir é a de Clarify, para obtê-la acesse o [link](https://docs.clarifai.com/clarifai-basics/authentication/app-specific-api-keys/).
   Após obter suas chaves, ponha no arquivo a sua chave:
   ```py
   TAVILY_API_KEY = <YOUR API KEY>
   ```

### Executando o projeto

1. Certifique-se de que o Ollama esteja configurado corretamente.
2. Verifique se os modelos de visão foram baixados e estão acessíveis.
3. Execute o programa principal com:
   ```sh
   npm run dev
   ```

---