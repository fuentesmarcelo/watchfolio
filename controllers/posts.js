const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post"); 
const Comment = require("../models/Comment");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts, user: req.user }); // Pass `user` to the template
    } catch (err) {
      console.log(err);
      res.status(500).send("Error loading feed");
    }
  },  
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 }).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  getEditPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).lean();
      if (!post) return res.status(404).send("Post not found");
      if (post.user.toString() !== req.user.id) {
        return res.redirect("/feed");
      }
      res.render("editPost", { post, user: req.user });
    } catch (err) {
      console.error(err);
      res.redirect("/feed");
    }
  },
  updatePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).send("Post not found");
      if (post.user.toString() !== req.user.id) {
        return res.redirect("/feed");
      }

      post.title = req.body.title;
      post.text = req.body.text;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        post.image = result.secure_url;
        post.cloudinaryId = result.public_id;
      }
      await post.save();
      res.redirect(`/post/${post._id}`);
    } catch (err) {
      console.error(err);
      res.redirect("/feed");
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById(req.params.id);
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.findOneAndDelete(req.params.id);
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};