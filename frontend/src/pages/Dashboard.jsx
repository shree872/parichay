import { useEffect, useState } from "react"

import api from "../services/api"

function Dashboard() {

    const [contacts, setContacts] = useState([])

    const [name, setName] = useState("")
    const [company, setCompany] = useState("")
    const [designation, setDesignation] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [website, setWebsite] = useState("")
    const [address, setAddress] = useState("")

    const fetchContacts = async () => {

        try {

            const response = await api.get("/contacts")

            setContacts(response.data)

        } catch (error) {

            console.log(error)

            alert("Failed to fetch contacts")
        }
    }

    const createContact = async (e) => {

        e.preventDefault()

        try {

            await api.post("/contacts", {
                name,
                company,
                designation,
                phone,
                email,
                website,
                address
            })

            alert("Contact added")

            fetchContacts()

            setName("")
            setCompany("")
            setDesignation("")
            setPhone("")
            setEmail("")
            setWebsite("")
            setAddress("")

        } catch (error) {

            console.log(error)

            alert("Failed to add contact")
        }
    }

    useEffect(() => {

        fetchContacts()

    }, [])

    return (

        <div className="min-h-screen bg-gray-100 p-8">

            <h1 className="text-4xl font-bold mb-8">
                My Contacts
            </h1>

            <form
                onSubmit={createContact}
                className="bg-white p-6 rounded-xl shadow mb-8 grid gap-4"
            >

                <input
                    type="text"
                    placeholder="Name"
                    className="border p-3 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Company"
                    className="border p-3 rounded"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Designation"
                    className="border p-3 rounded"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Phone"
                    className="border p-3 rounded"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="border p-3 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Website"
                    className="border p-3 rounded"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Address"
                    className="border p-3 rounded"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white p-3 rounded"
                >
                    Add Contact
                </button>

            </form>

            <div className="grid gap-4">

                {
                    contacts.map((contact) => (

                        <div
                            key={contact.id}
                            className="bg-white p-6 rounded-xl shadow"
                        >

                            <h2 className="text-2xl font-semibold">
                                {contact.name}
                            </h2>

                            <p>
                                {contact.company}
                            </p>

                            <p>
                                {contact.email}
                            </p>

                            <p>
                                {contact.phone}
                            </p>

                        </div>
                    ))
                }

            </div>

        </div>
    )
}

export default Dashboard