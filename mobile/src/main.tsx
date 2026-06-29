import React from "react";
import ReactDOM from "react-dom/client";
import { IonApp, IonContent, IonPage } from "@ionic/react";
import "@ionic/react/css/core.css";

function App() {
  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen>TodoList mobile skeleton</IonContent>
      </IonPage>
    </IonApp>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
