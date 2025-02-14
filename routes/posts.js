const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth } = require("../middleware/auth");

//Post Routes
router.get("/:id", ensureAuth, postsController.getPost);

// Edit Post
router.get("/:id/edit", ensureAuth, postsController.getEditPost);
router.put("/:id", ensureAuth, upload.single("file"), postsController.updatePost);

// Create Post
router.post("/createPost", upload.single("file"), postsController.createPost);

// Like Post
router.put("/likePost/:id", postsController.likePost);

// Delete Post
router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
