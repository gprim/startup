import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { AuthContextProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </AuthContextProvider>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
