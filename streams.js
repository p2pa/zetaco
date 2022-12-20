const Moralis = require("moralis").default;

module.exports = function(){
    this.addStream = async function(options) {
        const { networkType, webhookUrl, tag, description, chains } = options;
        const result = await Moralis.Streams.add({
          networkType,
          webhookUrl,
          chains,
          tag,
          description,
          includeNativeTxs: true,
        });
      
        return result.raw;
    }

    this.getStreams = async function(){
        const result = await Moralis.Streams.getAll({
            limit: 20,
            networkType: 'evm',
        });  
        return result.raw;
    }

    this.deleteStream = async function(id, options){
        const result = await Moralis.Streams.delete({
            id,
            networkType: 'evm',
        });              
        return result.raw;
    }

    this.updateStream = async function (id, options) {
        const { networkType, webhookUrl, tag, description } = options;
        const result = await Moralis.Streams.update({
            id,
            networkType,
            webhookUrl,
            chains: CHAINIDS,
            tag,
            description,
            includeNativeTxs: true,
        })
    }
}