const express = require('express');
const Blog = require('../models/blog'); // Assuming the Blog model is in models/Blog.js


// Create a new blog post
const createBlog = async (req, res) => {

    try {
        const { bannerImage, title, description ,uuid} = req.body;
   
        const newBlog = new Blog({ bannerImage, title, description,uuid });
        await newBlog.save();
        res.status(201).json({ success: true, data: newBlog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Get all blog posts
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Get a single blog post by ID
const getBlogById = async (req, res) => {

    try {
        const blog = await Blog.findOne({ uuid:req.params.blog  });
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        console.error('Error retrieving blog:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Update a blog post by ID
const updateBlog = async (req, res) => {

    try {
        const { bannerImage, title, description } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { bannerImage, title, description },
            { new: true, runValidators: true }
        );
        if (!updatedBlog) return res.status(404).json({ success: false, error: 'Blog not found' });
        res.status(200).json({ success: true, data: updatedBlog });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Delete a blog post by ID
const deleteBlog = async (req, res) => {

    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ success: false, error: 'Blog not found' });
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

module.exports = {
    deleteBlog,
    updateBlog,
    createBlog,

    getAllBlogs,
    getBlogById
};

