const Model = require("../models")
const productController = Model.product


const addNew = async (req,res)=>{
    try {
        const data = req.body;
        await productController.create(data);
        res.send("created successfully");
    } catch (error) {
        res.send(error);
    }
}
const viewAll = async(req,res)=>{
    try {
        const data = await productController.findAll();
        res.send(data);
    } catch (error) {
        res.send(error);
    }
}
const viewById= async(req,res)=>{
    try {
        const {id}=req.params
        const data = await productController.findOne({
            where:{id:id},
        })
        res.send(data);
    } catch (error) {
        res.send(error);
    }
}
const updateById = async(req,res)=>{
    try {
        const {id}=req.params
        const data = await productController.update(req.body,{
            where:{id:id},
        })
        res.send(data);
    } catch (error) {
        res.send(error);
    }
}
const deleteById = async(req,res)=>{
    try {
        const {id}=req.params;
        await productController.destroy({
            where:{id:id},
        })
        res.send("deleted successfully")
    } catch (error) {
        res.send(error);
    }
}
module.exports={
    addNew,
    viewAll,
    viewById,
    updateById,
    deleteById
}