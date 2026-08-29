"use client";

import { useForm,SubmitHandler } from "react-hook-form";
import classes from "@/app/Contact.module.css"
import type { ContactForm } from "@/app/_types/types";

export default function Contact ()  {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>();

  const onSubmit : SubmitHandler<FormInputs> = async (data) => {
    try {
      const res = await fetch("https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/contacts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      console.log("送信できました！", result);
      alert("送信しました！");
      reset();
    } catch (err) {
      console.log("送信エラー", err);
      alert("送信エラー");
    }
  };

  const handleReset = () => reset();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>問合わせフォーム</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={classes.formRow}>
          <label htmlFor="name" className={classes.label}>
            お名前
          </label>
          <div className={classes.inputWrapper}>
            <input
              id="name"
              type="text"
              disabled={isSubmitting} 
              className={classes.input}
              {...register("name", {
                required: "お名前は必須です。",
                maxLength: {
                  value: 30,
                  message: "名前は30文字以内にしてください。",
                },
              })}
            />
            <p className={classes.error}>{errors.name?.message}</p>
          </div>
        </div>

        <div className={classes.formRow}>
          <label htmlFor="email" className={classes.label}>
            メールアドレス
          </label>
          <div className={classes.inputWrapper}>
            <input
              id="email"
              type="email"
              disabled={isSubmitting} 
              className={classes.input}
              {...register("email", {
                required: "メールアドレスは必須です。",
                pattern: {
                  value:
                    /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/,
                  message: "正しいメールアドレスを入力してください。",
                },
              })}
            />
            <p className={classes.error}>{errors.email?.message}</p>
          </div>
        </div>

        <div className={classes.formRow}>
          <label htmlFor="message" className={classes.label}>
            本文
          </label>
          <div className={classes.inputWrapper}>
            <textarea
              id="message"
              disabled={isSubmitting} 
              className={classes.textarea}
              {...register("message", {
                required: "本文は必須です。",
                maxLength: {
                  value: 500,
                  message: "本文は500文字以内にしてください。",
                },
              })}
            />
            <p className={classes.error}>{errors.message?.message}</p>
          </div>
        </div>

        <div className={classes.buttonArea}>
          <button
            type="submit"
            disabled={isSubmitting} 
            className={classes.submitButton}
          >
            {isSubmitting ? "送信中..." : "送信"}
          </button>
          <button
            type="button" 
            disabled={isSubmitting}
            onClick={handleReset}
            className={classes.clearButton}
          >
            クリア
          </button>
        </div>
      </form>
    </div>
  );
};