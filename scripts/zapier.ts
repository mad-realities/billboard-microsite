import fetch from "node-fetch";

export async function triggerCommunityMessageZap(payload: { fanId: string; text: string }[]) {
  const zapTriggerUrl = "https://hooks.zapier.com/hooks/catch/13937397/bn6pdhj/";
  console.log("sending to zapier", payload);
  const response = await fetch(zapTriggerUrl, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = await response.json();
  console.log("post to zap response", data);
}
