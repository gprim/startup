import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { AuthContextProvider } from "./context/AuthContext";
import { Login } from "./components/Login";
import { CreateAccount } from "./components/CreateAccounts";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
          </Routes>
        </main>
        <Footer />
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
