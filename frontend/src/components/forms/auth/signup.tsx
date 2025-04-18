import { useContext, useState } from "react";
import Button from "../../Buttons/Button.tsx";
import Input from "../../input/Input.tsx";
import InputWrapper from "../../input/InputWrapper.tsx";
import Label from "../../input/Label.tsx";
import Form from "../Form.tsx";
import "../forms.css";
import FormTitle from "../FormTitle.tsx";
import ModalContainer from "../ModalContainer.tsx";
import TestAccountButton from "./TestAccountButton.tsx";
import {
  CurrentUserContext,
  CurrentUserContextType,
} from "../../../context/CurrentUserContext.ts";
import user from "../../../fetchers/user.ts";
import ErrorMessage from "../../input/ErrorMessage.tsx";
import "./auth.css";

export default function SignUp({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { setCurrentUser } = useContext(
    CurrentUserContext
  ) as CurrentUserContextType;

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  async function signUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Signing up");
    const form = event.target as HTMLFormElement;
    let errors = false;
    const clientErrors = {
      username: "",
      password: "",
      confirmPassword: "",
    };
    const usernameLI = form.elements.namedItem(
      "usernameSU"
    ) as HTMLInputElement;
    if (usernameLI.value.length < 1 || usernameLI.value.length > 20) {
      clientErrors.username = "Username must be 1-20 characters";
      errors = true;
    }
    const passwordLI = form.elements.namedItem(
      "passwordSU"
    ) as HTMLInputElement;
    if (passwordLI.value.length < 1 || passwordLI.value.length > 20) {
      clientErrors.password = "Password must be 1-20 characters";
      errors = true;
    }
    const confirmpasswordSU = form.elements.namedItem(
      "confirmpasswordSU"
    ) as HTMLInputElement;
    if (passwordLI.value !== confirmpasswordSU.value) {
      clientErrors.confirmPassword = "Passwords must match";
      errors = true;
    }
    if (errors) {
      setErrors(clientErrors);
      return;
    }
    console.log("No client errors");
    const info = await user.signUp(
      usernameLI.value,
      passwordLI.value,
      confirmpasswordSU.value
    );
    console.log("Info from sign up", info);
    if (info && info.success) {
      if (info.id && info.username) {
        setCurrentUser({ id: info.id, username: info.username, success: true });
      }
      location.href = "/";
    } else {
      if (info && info.success === false && info.errorMessage) {
        console.log("Error signing up", info.errorMessage);
        setErrors({
          username: info.errorMessage,
          password: "",
          confirmPassword: "",
        });
        return;
      }
      console.log("Error logging in", info);
    }
  }

  function closeModal() {
    setOpen(false);
    errorClearer();
  }

  function errorClearer() {
    setErrors({
      username: "",
      password: "",
      confirmPassword: "",
    });
  }
  return (
    <ModalContainer
      isOpen={open}
      onClose={() => {
        setOpen(true);
      }}
    >
      <Button className="modalCloseButton" onClick={closeModal} type="button">
        X
      </Button>
      <FormTitle title="Sign Up" />
      <Form onSubmit={signUp}>
        <div className="inputContent">
          <InputWrapper>
            <Label htmlFor="usernameSU" text="Username" className="" />
            <Input
              className=""
              type="text"
              id="usernameSU"
              name="usernameSU"
              onChange={errorClearer}
            />
            <ErrorMessage>{errors.username}</ErrorMessage>
          </InputWrapper>
          <InputWrapper>
            <Label htmlFor="passwordSU" text="Password" className="" />
            <Input
              className=""
              type="password"
              id="passwordSU"
              name="passwordSU"
              onChange={errorClearer}
            />
            <ErrorMessage>{errors.password}</ErrorMessage>
          </InputWrapper>
          <InputWrapper>
            <Label
              htmlFor="confirmpasswordSU"
              text="Confirm Password"
              className=""
            />
            <Input
              className=""
              type="password"
              id="confirmpasswordSU"
              name="confirmpasswordSU"
              onChange={errorClearer}
            />
            <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
          </InputWrapper>
        </div>

        <Button
          type="submit"
          size="medium"
          className="authButton"
          onClick={() => {}}
        >
          Submit
        </Button>
        <TestAccountButton size="medium" />
      </Form>
    </ModalContainer>
  );
}
