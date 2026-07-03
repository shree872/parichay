import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        try {

            const params = new URLSearchParams()

            params.append("username", email)
            params.append("password", password)

            const response = await api.post(
            "/login",
            params,
          {
              headers: {
                   "Content-Type":
                       "application/x-www-form-urlencoded",
                       },
         }
      )

            const token = response.data.access_token

            localStorage.setItem(
                "token",
                token
            )

            navigate("/dashboard")

            console.log(response.data)

        } catch (error) {

            console.log(error)

            alert("Login failed")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow-md w-96"
            >

                <h1 className="text-3xl font-bold mb-6 text-center">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full p-3 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full p-3 border rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-3 rounded"
                >
                    Login
                </button>

            </form>

        </div>
    )
}

export default Login