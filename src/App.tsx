import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { AuthContextProvider } from "./context/AuthContext";
import { Login } from "./components/Login";
import { CreateAccount } from "./components/CreateAccounts";
import { MessagePage } from "./components/messages/MessagePage";
import { Logout } from "./components/Logout";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/messages" element={<MessagePage />} />
          </Routes>
        </main>
        <Footer />
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
