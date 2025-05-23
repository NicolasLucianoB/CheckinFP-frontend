# checkin-frontend - Volunteer Check-in System

**CheckinFP** is a web application designed to streamline the check-in process for volunteers at events using **QR codes** for authentication and attendance tracking. The platform is built with **Next.js** and leverages **JWT** for secure authentication and session management.

## 🚀 Technologies Used

This project utilizes the following technologies:

- **Next.js**: React-based framework for building the application with SSR (Server Side Rendering) and SSG (Static Site Generation).
- **TypeScript**: Typed superset of JavaScript for better tooling and reliability.
- **Tailwind CSS**: Utility-first CSS framework for building modern, responsive UIs.
- **JWT (JSON Web Token)**: For secure user authentication and authorization.
- **React Context API**: For managing global state, particularly user authentication status.
- **Vercel**: Deployment platform optimized for Next.js applications.

## 🛠 Installation

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/NicolasLucianoB/CheckinFP-frontend.git
cd CheckinFP-frontend
```

### 2. Install Dependencies

Navigate to the `checkin-frontend` directory and install the required dependencies:

```bash
cd checkin-frontend
yarn install
```

### 3. Start the Development Server

```bash
yarn dev
```

Now, open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🧑‍💻 Running the Application

After following the installation steps, you can start the application by running:

```bash
yarn dev
```

This will start the Next.js development server. The app will be accessible at:

- **Frontend (Next.js)**: `https://checkin-fp-frontend.vercel.app`
- **Backend (Go)**: `https://checkinfp-backend.onrender.com` (Ensure the backend is running)

### 📝 Default Pages

- **Home**: A dashboard displaying volunteer data, attendance stats, and a check-in button.
- **Check-in**: Volunteers scan QR codes (generated by admin) that automatically register their attendance with token authentication.
- **Login**: Secure login page for user authentication.
- **Signup**: New users can register themselves to use the platform.

---

## 🧑‍🔧 Project Structure

Here's the general structure of the project:

```
CheckinFP/
├── checkin-frontend/             # Frontend (Next.js)
│   ├── app/                      # Pages and routing for the app
│   ├── components/               # Reusable components (buttons, modals, etc.)
│   ├── public/                   # Static files (images, fonts, etc.)
│   └── styles/                   # Tailwind CSS configurations and custom styles
└── checkin-backend/              # Backend (Go)
    ├── controllers/              # API controllers for handling requests
    ├── middlewares/              # Middleware (authentication, authorization)
    ├── models/                   # Database models and ORM configuration
    └── main.go                   # Main entry point for the Go server
```

---

## 🔐 Authentication

The authentication system is based on **JWT (JSON Web Token)**. When logging in, users receive a token that must be included in subsequent requests to access protected routes, such as the check-in page.

1. **Login**: Users authenticate with their credentials, and the backend returns a JWT token.
2. **Token Validation**: The frontend validates the token via a secure `/me` route, and the user context is updated accordingly.

---

## 📦 Deployment

The frontend is hosted on **Vercel**, providing optimized deployment for Next.js applications. The backend is hosted on **Render**, a modern cloud platform for hosting backend services.

- [Deploy to Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
- [Render Documentation](https://render.com/docs)
- [Heroku Deployment Documentation](https://devcenter.heroku.com/articles/git)
- [DigitalOcean Deployment Docs](https://www.digitalocean.com/docs/)

---

## 🌐 Links and Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn more about Next.js features and APIs.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - View the source code and contribute.
- [JWT.io Introduction](https://jwt.io/introduction/) - Learn more about JSON Web Tokens.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔧 TODOs and Roadmap

- ✅ Add admin panel with manual QR Code generation for each event (valid for 3 hours).
- Expand reporting and ranking features for volunteers.
