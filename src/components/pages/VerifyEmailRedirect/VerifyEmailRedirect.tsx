import { Link, useNavigate } from "react-router-dom";
import "./VerifyEmailRedirect.css";
import { useEffect } from "react";

const VerifyEmailRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyEmail() {
      try {
        const urlParams = new URLSearchParams(window.location.search);

        const token = urlParams.get("token");
        const email = urlParams.get("email");

        const response = await fetch(`http://localhost:4000/auth/verify-email`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            email: email,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify email");
        }

        const data = await response.json();

        navigate("/login");
      } catch (error) {
        console.error(error);
      }
    }

    verifyEmail();
  }, []);

  return (
    <main className="verify-email-redirect">
      <p>Your profile is being verified, You will be redirected back to pbmrkt.</p>
      <p>
        If you aren't redirected after 10 seconds, click here:{" "}
        <Link to="/">Navigate home</Link>.
      </p>
    </main>
  );
};
export default VerifyEmailRedirect;
