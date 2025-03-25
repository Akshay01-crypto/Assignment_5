/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Akshay Nedumparambil Unnikrishnan Student ID: 190635235 Date: March 24, 2025
*  Online (Vercel) Link: 
*
*********************************************************************************/

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const collegeData = require("./collegeData.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");


app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});


const excludedCourseCodes = ["DBD800", "DBW825", "SEC835", "WTP100"];


app.get("/", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            const filteredCourses = courses.filter(course => !excludedCourseCodes.includes(course.courseCode));
            res.render("layouts/main", { body: "home", courses: filteredCourses, activeRoute: "/" });
        })
        .catch(() => {
            res.render("layouts/main", { body: "home", courses: [], activeRoute: "/" });
        });
});

app.get("/about", (req, res) => {
    res.render("layouts/main", { body: "about", activeRoute: "/about" });
});

app.get("/htmlDemo", (req, res) => {
    res.render("layouts/main", { body: "htmlDemo", activeRoute: "/htmlDemo" });
});

app.get("/students", (req, res) => {

    collegeData.getCourses()
        .then((courses) => {
            const filteredCourses = courses.filter(course => !excludedCourseCodes.includes(course.courseCode));
            if (req.query.course) {
                collegeData.getStudentsByCourse(req.query.course)
                    .then((students) => {
                        res.render("layouts/main", {
                            body: "students",
                            students: students,
                            courses: filteredCourses,
                            selectedCourse: req.query.course,
                            activeRoute: "/students"
                        });
                    })
                    .catch(() => {
                        res.render("layouts/main", {
                            body: "students",
                            message: "no results",
                            courses: filteredCourses,
                            selectedCourse: req.query.course,
                            activeRoute: "/students"
                        });
                    });
            } else {
                collegeData.getAllStudents()
                    .then((students) => {
                        res.render("layouts/main", {
                            body: "students",
                            students: students,
                            courses: filteredCourses,
                            selectedCourse: null,
                            activeRoute: "/students"
                        });
                    })
                    .catch(() => {
                        res.render("layouts/main", {
                            body: "students",
                            message: "no results",
                            courses: filteredCourses,
                            selectedCourse: null,
                            activeRoute: "/students"
                        });
                    });
            }
        })
        .catch(() => {
            res.render("layouts/main", {
                body: "students",
                message: "Unable to load courses",
                courses: [],
                selectedCourse: null,
                activeRoute: "/students"
            });
        });
});

app.get("/student/:num", (req, res) => {
    collegeData.getStudentByNum(req.params.num)
        .then((student) => res.render("layouts/main", { body: "student", student: student, activeRoute: "/student" }))
        .catch(() => res.status(404).send("Student Not Found"));
});

app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {

            const filteredCourses = courses.filter(course => !excludedCourseCodes.includes(course.courseCode));
            res.render("layouts/main", { body: "courses", courses: filteredCourses, activeRoute: "/courses" });
        })
        .catch(() => res.render("layouts/main", { body: "courses", message: "no results", activeRoute: "/courses" }));
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((data) => res.render("layouts/main", { body: "course", course: data, activeRoute: "/course" }))
        .catch((err) => res.status(404).send(err));
});

app.get("/students/add", (req, res) => {
    res.render("layouts/main", { body: "addStudent", activeRoute: "/students/add" });
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch(err => res.json({ error: err }));
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch(err => res.json({ error: err }));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "views/404.html"));
});

collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`));
    })
    .catch((err) => {
        console.error(err);
    });