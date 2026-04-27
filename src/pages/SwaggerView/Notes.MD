import React from "react";
import ReactDOM from "react-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const HelloPlugin = () => {
  return {
    wrapComponents: {
      OperationTag: (Original, system) => (props) => {
        return (
          <div>
            <Original {...props} />
            <style>{`
              .opblock-summary {
                position: relative;
              }
              .opblock-summary::before {
                content: 'Hello';
                position: absolute;
                right: 50px;
                top: 50%;
                transform: translateY(-50%);
                padding: 4px 8px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                z-index: 1;
              }
            `}</style>
          </div>
        );
      },
    },
  };
};

function App() {
  return (
    <div className="App">
      <SwaggerUI
        url="https://petstore3.swagger.io/api/v3/openapi.json"
        plugins={[HelloPlugin]}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);