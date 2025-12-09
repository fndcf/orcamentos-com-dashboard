import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #FF6B35;
    --primary-dark: #E55A2B;
    --primary-light: #FF8C5A;
    --secondary: #1A1A2E;
    --secondary-light: #16213E;
    --background: #F5F5F5;
    --surface: #FFFFFF;
    --text-primary: #1A1A2E;
    --text-secondary: #666666;
    --text-light: #999999;
    --success: #4CAF50;
    --warning: #FFC107;
    --error: #F44336;
    --info: #2196F3;
    --border: #E0E0E0;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.6;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul, ol {
    list-style: none;
  }
`;
