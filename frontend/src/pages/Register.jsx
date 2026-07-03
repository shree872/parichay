import { useState } from "react"
import api from "../services/api"

function Register() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault()

        try {

            const response = await api.post("/register", {
                email: email,
                password: password
            })

            alert("User registered successfully")

            console.log(response.data)

        } catch (error) {

            console.log(error)

            alert("Registration failed")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-xl shadow-md w-96"
            >

                <h1 className="text-3xl font-bold mb-6 text-center">
                    Register
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
                    Register
                </button>

            </form>

        </div>
    )
}

export default Register