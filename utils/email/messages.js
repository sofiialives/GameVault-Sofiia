const registerMessage = (email, pseudo = "") => {
    return {
        to: email,
        subject: "Bienvenue sur GameVault",
        html: `<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 20px; background: linear-gradient(to bottom, #000000, #333333); color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);">
  <h1>Bienvenue ${pseudo} 😊</h1>
  <p>Votre compte GameVault est prêt.</p>
</div>`,
    };
};

const messages = {
    registerMessage
};

module.exports = {
    messages,
};
