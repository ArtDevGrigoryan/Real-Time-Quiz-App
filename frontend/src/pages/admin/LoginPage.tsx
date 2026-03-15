import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import Axios from "../../axios.config";
import type { IResponse } from "../../types/api.types";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setServerError(null);

    try {
      const { data: res } = await Axios.post<IResponse<string>>(
        "/auth/login",
        data,
      );

      localStorage.setItem("Authorization", res.payload);

      window.location.href = "/admin/sessions";
    } catch (err) {
      setServerError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm space-y-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl w-full space-y-6 transition-colors duration-300"
        >
          <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            Admin Login
          </h1>

          {serverError && (
            <p className="text-red-500 text-sm text-center animate-pulse">
              {serverError}
            </p>
          )}

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="username" className="font-medium">
                Username
              </Label>

              <Input
                id="username"
                {...register("username")}
                placeholder="Enter username"
                className="mt-1 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all duration-200"
              />

              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <Label htmlFor="password" className="font-medium">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password"
                className="mt-1 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all duration-200"
              />

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-lg py-3 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
            Enter your admin credentials to access the panel
          </p>
        </form>

        {/* back button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            ← Back to Join
          </button>
        </div>
      </div>
    </div>
  );
}
