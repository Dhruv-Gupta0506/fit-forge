# 💪 FitForge – Fitness Tracking & Personalized Workout App

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

<br />

> **A MERN-based fitness tracking platform where users can log workouts, create routines, generate meal plans, and track daily progress through a clean, responsive dashboard.**

🔗 **Live Demo:** https://fitforge-eta.vercel.app/

---

## 📸 Screenshots

![login](https://github.com/user-attachments/assets/899564aa-c631-4847-b3c4-29c2a1a2286e)
![workout](https://github.com/user-attachments/assets/3fa69470-9543-400b-a8ac-71c3a45247df)
![dashboard](https://github.com/user-attachments/assets/d95ae718-72bf-4911-a9f1-69ef03750cd8)


---

## ✨ Features

- **🔐 Secure Authentication:** Complete login/signup system using JWT (JSON Web Tokens).
- **🏋️‍♂️ Workout Generator:** Personalized workout plans based on user goals.
- **🥗 Smart Meal Plans:** Custom meal suggestions for cutting or bulking.
- **🔥 Streak Tracking:** Daily tasks and streak counters for motivation.
- **📊 Profile Management:** Editable fitness profile (age, height, weight, BMI).
- **📱 Responsive UI:** Optimized for both mobile and desktop with charts.

---

## 🛠️ Tech Stack

| Component | Technology |
|----------|------------|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT (JSON Web Tokens) |
| Deployment | Vercel (Client), Render (Server) |

---

## 📁 Project Structure

```
fit-forge/
├── client/
├── server/
└── README.md
```

---

## 🔧 Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Dhruv-Gupta0506/fit-forge
cd fit-forge
```

---

### 2️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

### 3️⃣ Backend Setup

```bash
cd server
npm install
```

---

### 4️⃣ Environment Variables

Create a `.env` file inside the `server` directory and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 5️⃣ Start Backend Server

```bash
npm start
```

---

## 📌 Implementation Notes

**Cold Starts:**  
The backend is deployed on Render’s free tier. A cron job is used to keep the server warm and reduce cold-start delays.

**Performance:**  
Optimized MongoDB queries ensure fast dashboard rendering and workout log retrieval.

---

Made with ❤️ by Dhruv Gupta
