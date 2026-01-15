<div align="center">

# 🌤️ Weather App  
### React Native • Expo • Mobile First

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000?style=for-the-badge&logo=expo)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000)


📱 Aplicativo de clima moderno, focado em **UX**, **animações suaves** e **arquitetura limpa**.

</div>

---

## 🧭 Visão Geral

> 🔹 Este projeto foi desenvolvido com o objetivo de aplicar **boas práticas de React Native**, separação de responsabilidades e uma experiência fluida para o usuário.

### O app permite:
- Buscar cidades
- Usar localização atual
- Alternar unidades de temperatura
- Visualizar previsão diária
- Salvar preferências localmente

---

## ✨ Funcionalidades Principais

🟢 **Localização automática**  
🔍 **Busca inteligente de cidades (API)**  
🕘 **Histórico de cidades recentes**  
🌡️ **Celsius ↔ Fahrenheit (UnitToggle animado)**  
🌙 **Detecção automática de dia/noite**  
📆 **Previsão diária (Daily Forecast)**  
⚡ **Feedback tátil com Haptics**  
💾 **Persistência com AsyncStorage**

---

## 🧠 Arquitetura do Projeto

> 📌 Organização pensada para facilitar manutenção e escalabilidade

```txt
src/

├───components
│       DailyForecast.jsx
│       HeaderLocation.jsx
│       MainWeatherCard.jsx
│       SearchBox.jsx
│       SearchOverlay.jsx
│       UnitToggle.jsx
│       WeatherError.jsx
│       WeatherGrid.jsx
│       WeatherLoading.jsx
│       
├───hooks
│       useCitySearch.jsx
│       useLocation.jsx
│       useWeather.jsx
│
├───navigation
│       StackNavigator.jsx
│       TabNavigator.jsx
│
├───screens
│       Home.jsx
│
├───storage
│       weatherStorage.jsx
│
└───utils
        cityApi.jsx
        getWeatherDescription.jsx
        getWeatherEmoji.jsx
        temperature.jsx

```

## ▶️ Como Rodar o Projeto

Siga os passos abaixo para executar o projeto de clima localmente.

### 📌 Pré-requisitos
Antes de começar, você precisa ter instalado em sua máquina:

- **Node.js** (versão LTS recomendada)
- **Git**
- **Expo CLI**
- Um dispositivo físico com **Expo Go** ou um **emulador Android/iOS**

---

### 📥 Clonar o repositório
```bash

git clone https://github.com/seu-usuario/seu-repositorio.git
cd appclima

```
### 📦 Instalar dependências
```bash

npm install

ou, se utilizar Yarn

yarn install

```

### ▶️ Executar o projeto
```bash

npx expo start

```


## 🚀 Como Executar o Projeto

Para visualizar o aplicativo em execução, siga os passos abaixo:

1. Certifique-se de ter o **Node.js** e o **Expo CLI** instalados.

2. Instale as dependências com `npm install` ou `yarn`.
   
3. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start


