
const memberModel = require('../models/member.model')
const projectModel = require('../models/project.model')
const teamsModel = require('../models/teams.model')


exports.add_project = async (req, res) => {
    const { project_name, duration, department, launch_date, client_name, status } = req.body;
    let project1 = await projectModel.count();
    let code = `SICS-Project-${project1 + 1}`

    var date_ob = new Date();
    let addproject;
    try {
        addproject = await projectModel.create(
            {
                project_name,
                duration: date_ob,
                department,
                launch_date,
                client_name,
                status,
                code

            });

    }
    catch (err) {
        console.log(err)
    }
    res.status(201).json({
        success: true,
        data: addproject
    });
},

    exports.add_team = async (req, res) => {
        const { project_id, team_leader_id, team_name, selectedOptions, code } = req.body;
        const { userId } = req.body;
        console.log(req)
        let addmember;
        try {
            let addteam = await teamsModel.create(
                {
                    projectCode: code,
                    project_id,
                    team_leader_id,
                    team_name,

                });
            for (let x of selectedOptions) {

                addmember = await memberModel.create(
                    {
                        projectCode: code,
                        project_id,
                        team_id: addteam._id,
                        userId: x.value,

                    });
            }


        }
        catch (err) {
            console.log(err)
        }
        res.status(201).json({
            success: true,
        });
    },

    exports.project = async (req, res) => {
        let project;
        try {

            // project = await projectModel.find({ code: req.params.code })
            let data = await projectModel.aggregate([
                {
                    $match: {
                        code: req.params.code
                    },

                },
                {
                    $lookup: {
                        from: 'teams',
                        localField: 'code',
                        foreignField: 'projectCode',
                        as: 'teams'
                    }
                },
                {
                    $lookup: {
                        from: 'member',
                        localField: 'code',
                        foreignField: 'projectCode',
                        as: 'members'
                    }
                },
            ])
            return res.json(data);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
  


