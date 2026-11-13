
<div
  key={task.id}
  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#29432e] bg-black/20 px-4 py-3"
>
  <div>
    <p className="text-sm font-semibold text-white">
      {task.id === "task-1"
        ? "Visit WEALTHORA WhatsApp Community"
        : "Visit WEALTHORA Telegram Channel"}
    </p>

    <strong className="mt-1 block text-sm text-[#b7ff35]">
      ₦{task.amount.toLocaleString("en-NG")}
    </strong>
  </div>

  <a
    href={
      task.id === "task-1"
        ? "https://chat.whatsapp.com/L88T8xQYNUKDITeQzFzyJ5?s=cl&p=a&iam=2"
        : "https://t.me/WealthoraCommunity"
    }
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl bg-[#b7ff35] px-5 py-2.5 text-sm font-extrabold text-[#071b10]"
  >
    Claim
  </a>
</div>
