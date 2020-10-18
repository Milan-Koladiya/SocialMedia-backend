const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require('path')
const fs = require('fs')
const auth = require("../auth/auth");

const postModel = require("../models/post");

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Uploads/post");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: Storage,
    limits: { fileSize: 1000000 },
});

// ************* create Post ***************

router.post("/createpost", auth, upload.single('Image'), async (req, res) => {
    try {
        let post = req.body;
        post.Post = req.file.filename
        if (!post.Title || !post.Body) {
            return res.status(400).json({ error: "Please fill all the field" });
        }
        post.Postedby = req.user;
        new postModel(post).save((error, result) => {
            if (error) {
                res.status(400).json({ error: "error In post post" });
            }
            res.status(200).json("posted succesfully");
        });
    } catch (error) {
        res.status(400).json({ error: "error In post post" });
    }
});

// ************* update Post ***************

router.patch("/updatepost/:id", auth, async (req, res) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const post = req.body;
        postModel
            .findOneAndUpdate({ _id: id, Postedby: user._id }, post)
            .then((data) => {
                if (!data) {
                    return res.status(400).josn({ error: "data not found" });
                }
                res.status(200).send("update successfulyy");
            })
            .catch((err) => {
                res.status(200).send("error to update data");
            });
    } catch (error) {
        res.status(400).json({ error: "there is some error ocuured" });
    }
});

// ************* my Post ***************

router.get("/mypost", auth, async (req, res) => {
    try {
        const user = req.user;
        const post = await postModel.find({ Postedby: user._id });
        if (!post) {
            return res.status(400).send("no post available");
        }
        res.send(post);
    } catch (error) {
        return res.status(400).send("no post available");
    }
});

// ************* userpost Post ***************

router.get("/mypost", auth, async (req, res) => {
    try {
        const user = req.user;
        const id = req.query.username
        const post = await postModel.find({ Postedby: user._id });
        if (!post) {
            return res.status(400).send("no post available");
        }
        res.send(post);
    } catch (error) {
        return res.status(400).send("no post available");
    }
});

// ************* delete Post ***************

router.delete("/deletepost/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        await postModel
            .findByIdAndDelete(id)
            .then(() => {
                return res.status(200).send("post delete success");
            })
            .catch((err) => {
                return res.status(400).json({ error: "post delete success" });
            });
    } catch (error) {
        return res.status(200).json({ error: "there is some error" });
    }
});

router.get('/uploads/profile', (req, res) => {
    const image = req.query.Image
    console.log(image)
    res.sendFile(path.join(__dirname, `../Uploads/profile/${image}`));
})

router.get('/uploads/post', (req, res) => {
    const postImage = req.query.Post
    const time = postImage.replace()
    res.sendFile(path.join(__dirname, `../Uploads/post/${postImage}`));
})

// ************* All Post With Pagignation ***************
router.get("/allpost", async (req, res) => {
    let qpage = req.query.page;
    const pages = qpage * 9 - 9;
    try {
        await postModel
            .find()
            .populate("Postedby")
            .skip(pages)
            .limit(9)
            .sort("createdAt")
            .then((data) => {
                data.map((post) => {
                    return post.Postedby.lastlogin = '', post.Postedby.Password = '', post.Postedby.tokens = []
                })
                postModel
                    .find()
                    .countDocuments()
                    .then((num) => {
                        res.status(200).send({ doc: num, data: data });
                    });
            });
    } catch (error) {
        res.status(400).json({ error: "Error in fetch data" });
    }
});

module.exports = router;
