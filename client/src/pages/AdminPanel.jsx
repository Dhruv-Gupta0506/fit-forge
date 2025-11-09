import { useEffect, useState } from "react";
import API from "../api/axios";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (id, field, value) => {
    setUsers((prev) =>
      prev.map((user) => (user._id === id ? { ...user, [field]: value } : user))
    );
  };

  const handleSave = async (user) => {
    try {
      await API.put(`/admin/users/${user._id}`, user, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("User updated!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error updating user.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">🛡️ Admin Panel</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Points</th>
              <th className="p-3">Streak</th>
              <th className="p-3">Title</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={user.points}
                    onChange={(e) => handleChange(user._id, "points", Number(e.target.value))}
                    className="border p-1 rounded w-20"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={user.streak}
                    onChange={(e) => handleChange(user._id, "streak", Number(e.target.value))}
                    className="border p-1 rounded w-16"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={user.title}
                    onChange={(e) => handleChange(user._id, "title", e.target.value)}
                    className="border p-1 rounded w-28"
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleSave(user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
