# Skin-Match AI 

An AI-powered tool that helps you find the perfect makeup products based on your country / continent.<br></br>
After getting the user's photo input, Google's Gemini API will analyze the skin tone and features to suggest the best makeup goods suited to their appearance.<br></br>

Try the live demo here: [https://skin-tone-match-ai.vercel.app/](https://skin-tone-match-ai.vercel.app/) (mobile and desktop).

## Showcase

<img src="https://github.com/user-attachments/assets/f1af66c5-7efc-4f9a-9e58-f50d0088ef21" alt="macbook-air-m2-lid-open" height="600rem">


## Technologies Used:  

- React JS
  
- TypeScript
  
- [Tailwind CSS](https://tailwindcss.com/)
  
- [Google's Gemini API](https://aistudio.google.com/welcome?utm_source=google&utm_medium=cpc&utm_campaign=FY25-global-DR-gsem-BKWS-1710442&utm_content=text-ad-none-any-DEV_c-CRE_726094551010-ADGP_Hybrid%20%7C%20BKWS%20-%20EXA%20%7C%20Txt-Gemini%20(Top%20EEA)-Gemini%20API-KWID_43700081668030981-kwd-927524447508&utm_term=KW_gemini%20api-ST_gemini%20api&gad_source=1&gbraid=0AAAAACn9t64y7D7IyTraCMgdrp1FjgtvQ&gclid=CjwKCAjwtdi_BhACEiwA97y8BOGvHZlmCaX7ZwTAMLuCsC6z3UqOVLf1o4dGykIXqajUjacgryDNhhoCceYQAvD_BwE&gclsrc=aw.ds) 

- [react-markdown](https://www.npmjs.com/package/react-markdown/v/8.0.6) (to properly style AI's output)


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
