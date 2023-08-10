module.exports = {
  data: {
    name: "Delete Message",
    message: "",
    channelFrom: "Command Channel",
    channel: "",
  },
  UI: {
    compatibleWith: ["Event", "Slash", "DM"],
    text: "Delete Message",
    sepbar: "",

    btext: "Message Variable",
    input_direct: "message",

    previewName: "Variable",
    preview: "message",
  },

  async run(values, interaction, client, bridge) {
    let varTools = require(`../Toolkit/variableTools.js`);
    var msg =
      bridge.variables[varTools.transf(values.message, bridge.variables)];

    msg.delete();
  },
};
