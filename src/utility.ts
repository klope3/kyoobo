import jwtDecode from "jwt-decode";
import {
  checkValidPassword,
  parseObjWithId,
  validPasswordMessage,
} from "./validations";
import { getAuthResult } from "./fetch";
import { NavigateFunction } from "react-router-dom";
import { UserAuthData } from "./components/AuthProvider";

export function getIdFromJwtToken(token: any) {
  const decoded = jwtDecode(token);
  const parsed = parseObjWithId(decoded);
  return parsed.id;
}

export function getDataFromAuthForm(form: HTMLFormElement) {
  const data = new FormData(form);
  const username = data.get("username");
  const email = data.get("email");
  const password = data.get("password");
  const confirmPassword = data.get("confirmPassword");
  return {
    username,
    email,
    password,
    confirmPassword,
  };
}

export function serverUrl() {
  const url = import.meta.env.VITE_SERVER_URL;
  if (url === undefined) console.error("The server url was undefined!");
  return url;
}

export function submitAuthForm(
  e: React.FormEvent<HTMLFormElement>,
  errorMessageCb: (message: string) => void,
  navigateCb: NavigateFunction,
  setUserCb: ((user: UserAuthData) => void) | null,
  createAccount = false
) {
  e.preventDefault();
  //get and validate form data
  const { username, email, password, confirmPassword } = getDataFromAuthForm(
    e.target as HTMLFormElement
  );
  if (
    (createAccount && typeof username !== "string") ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    errorMessageCb("Please fill out required fields.");
    return;
  }
  if (createAccount) {
    if (!checkValidPassword(password)) {
      errorMessageCb(validPasswordMessage);
      return;
    }
    if (password !== confirmPassword) {
      errorMessageCb("The passwords must match.");
      return;
    }
  }

  const usernameArg =
    createAccount && typeof username === "string" ? username : "";

  //use the data to actually fetch
  const endpoint = createAccount ? "users" : "login";
  getAuthResult(email, password, usernameArg, endpoint).then((result) => {
    const { data, errorMessage } = result;
    if (data && setUserCb) {
      const id = getIdFromJwtToken(data.token);
      setUserCb({
        id,
        username: data.username,
        email: data.email,
      });
      localStorage.setItem("token", data.token);
      navigateCb("/browse");
    } else if (errorMessage) {
      errorMessageCb(errorMessage);
    }
  });
}

export function abbreviateText(text: string, maxLength = 20) {
  const split = text.split(" ");
  if (split.length <= 20) return text;

  return split.slice(0, maxLength).join(" ") + " ...";
}
