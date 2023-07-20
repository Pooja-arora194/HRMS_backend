const eventModel = require("../models/event.model");



exports.add_event = async (req, res) => {
    const { event_title, event_date, event_description, start_time, end_time } = req.body;
    let data;
    try {
        data = await eventModel.create(
            {
                event_title,
                event_date,
                event_description,
                start_time,
                end_time

            });
       
    }
    catch (err) {
        console.log(err)
    }
    res.status(201).json({
        success: true,
        data: data
    });
},

    exports.events = async (req, res) => {

        let find;

        try {
            find = await eventModel.find().sort({ $natural: -1 });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
        return res.json(find);
    },

    exports.delete_event = async (req, res) => {

        let deleteevent;
        try {
            deleteevent = await eventModel.findOneAndDelete({ _id: req.params.id });
        }
        catch (error) {
            console.log(error);
        }

        res.status(201).json(deleteevent);
    },


    exports.edit_event = async (req, res) => {



        const { event_title, event_description, event_date, start_time, end_time } = req.body;
        let Filters = {

        }
        if (event_title) {
            Filters.event_title = event_title
        }
        if (event_description) {
            Filters.event_description = event_description
        }
        if (event_date) {
            Filters.event_date = event_date
        }
        if (start_time) {
            Filters.start_time = start_time
        }
        if (end_time) {
            Filters.end_time = end_time
        }

        let updates
        try {

            updates = await eventModel.findByIdAndUpdate(req.params.id,
                Filters
            );

        }
        catch (err) {

            console.log(err)
        }

        res.status(201).json({
            success: true,
            data: updates
        });



    }
