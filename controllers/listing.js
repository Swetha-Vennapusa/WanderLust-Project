const { response } = require("express");
const Listing = require("../models/listing");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new")
};

module.exports.category = async(req,res)=>{
    let {category} = req.params;
    let allListings = await Listing.find({category:category});
    res.render("listings/index",{allListings});
}
module.exports.search = async(req,res) =>{
    let name = req.query.q;
    let allListings = await Listing.find({title:name});
    res.render("listings/index",{allListings});
}
module.exports.output = async(req,res,next) => {
    let{place} = req.params;
    const allListings = await Listing.find({ title: { $regex: new RegExp(`^${place}$`, 'i') }  });
    if (allListings.length === 0) {
        return res.redirect('/listings/index');
    }
    res.render('listings/index', { allListings });
}

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews" ,
        populate:{
            path: "author",
        },
    })
    .populate("owner");
    console.log(listing);
    if(!listing) {
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show",{listing});
};

// module.exports.createListing = async (req,res,next) => {
//     // let response = await geocodingClient.forwardGeocode({
//     //     query: req.body.listing.location,
//     //     limit: 1
//     // })
//     //     .send();
//     let url = req.file.path;
//     console.log(url);
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     console.log(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url,filename};
//     // newListing.geometry = response.body.features[0].geometry;
//     let savedListing = await newListing.save();
//     // console.log(savedListing);
//     req.flash("success","New Listing Created");
//     res.redirect("/listings");
// };
module.exports.createListing = async (req,res,next) => {

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file != "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};