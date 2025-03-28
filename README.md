# Como executar

Para executar o projeto, você deve configurar tanto o frontend quanto o backend. Seguem os passos para ambos.

### Passos iniciais

1. **Instale o Ollama**  
   Você pode instalar o Ollama a partir deste [link](https://ollama.com/).

2. **Baixe os modelos necessários**  
   Após a instalação, você pode baixar alguns modelos executando os comandos abaixo no terminal:  
   ```sh
   ollama pull llama3.1:8b-instruct-q8_0
   ```

3. **Instale o Python**  
   Verifique se sua máquina possui o Python. Caso não possua, você pode baixar a partir do [Site Oficial](https://www.python.org/downloads/).

4. **Instale o Node**  
   Verifique se sua máquina possui o `node`. Caso não possua, você pode baixar a partir do [Site Oficial](https://nodejs.org/en/download).

### Preparando o ambiente

#### Frontend

1. **Acesse o diretório do frontend**  
   Entre no diretório do frontend com:
   ```sh
   cd frontend
   ```

2. **Instale as dependências do frontend**  
   No diretório do frontend, execute:
   ```sh
   npm install
   npm install -g expo-cli
   ```

3. **Execute o frontend**  
   Após instalar as dependências, inicie o frontend com:
   ```sh
   npm run dev
   ```

#### Backend

1. **Acesse o diretório do backend**  
   Entre no diretório do backend com:
   ```sh
   cd backend
   ```

2. **Crie um ambiente virtual**  
   Para criar o ambiente virtual e organizar suas dependências, execute:
   ```sh
   python3 -m venv .rv
   ```

3. **Ative o ambiente virtual**  
   No Linux/MacOS:
   ```sh
   source .rv/bin/activate
   ```
   No Windows:
   ```sh
   .rv\Scripts\activate
   ```

4. **Instale as dependências do backend**  
   Com o ambiente virtual ativado, instale as dependências do backend com:
   ```sh
   pip install -r requirements.txt
   ```

5. **Execute o backend**  
   Após a instalação das dependências, inicie o backend com:
   ```sh
   uvicorn src.main:app --reload
   ```

### Configuração de variáveis locais de API

1. **Crie o arquivo `.env`**  
   No diretório raiz do projeto, crie um arquivo chamado `.env` e adicione as variáveis de ambiente necessárias. O arquivo `.env` deve conter:

   ```env
   POSTGRES_USER=<YOUR_POSTGRES_USER>
   POSTGRES_PASSWORD=<YOUR_POSTGRES_PASSWORD>
   POSTGRES_DB=<YOUR_POSTGRES_DB>
   SECRET_KEY=<YOUR_SECRET_KEY>
   ALGORITHM=<YOUR_ALGORITHM>
   ACCESS_TOKEN_EXPIRE_MINUTES=<YOUR_ACCESS_TOKEN_EXPIRE_MINUTES>
   DATABASE_PORT=<YOUR_DATABASE_PORT>
   TAVILY_API_KEY=<YOUR_TAVILY_API_KEY>
   GOOGLE_API_KEY=<YOUR_GOOGLE_API_KEY>
   GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
   CLARIFAI_PAT=<YOUR_CLARIFAI_API_KEY>
   CLARIFY_API_KEY=<YOUR_CLARIFY_API_KEY>
   ```

   As chaves de API que você precisa obter:

   - **Tavily API**: Acesse o [site oficial](https://tavily.com/) para obter sua chave.
   - **Google API**: Acesse o [site oficial do Google Cloud](https://cloud.google.com/apis) para obter sua chave.
   - **Gemini API**: Acesse o [site da Gemini](https://aistudio.google.com/) para obter sua chave.
   - **Clarifai API**: Acesse [este link](https://docs.clarifai.com/clarifai-basics/authentication/app-specific-api-keys/) para obter sua chave.
   - **PostgreSQL**: Defina as configurações do banco de dados PostgreSQL.

### Executando o projeto

1. Certifique-se de que o Ollama esteja configurado corretamente.
2. Verifique se os modelos de visão foram baixados e estão acessíveis.
3. Para o **frontend**, execute no diretório `frontend`:
   ```sh
   npm run dev
   ```

4. Para o **backend**, execute no diretório `backend`:
   ```sh
   uvicorn src.main:app --reload
   ```
