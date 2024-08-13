import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Tailwind CSS 또는 기타 스타일 파일을 포함
import App from './App'; // 애플리케이션의 루트 컴포넌트

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // HTML의 'root' div에 렌더링
);
