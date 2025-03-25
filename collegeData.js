class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

const fs = require("fs");

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/courses.json", "utf8", (err, courseData) => {
            if (err) {
                reject("unable to load courses");
                return;
            }

            fs.readFile("./data/students.json", "utf8", (err, studentData) => {
                if (err) {
                    reject("unable to load students");
                    return;
                }
                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
};

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length === 0) {
            reject("no results");
            return;
        }
        resolve(dataCollection.students);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        const filteredStudents = dataCollection.students.filter(student => student.course == course);
        if (filteredStudents.length === 0) {
            reject("no results");
            return;
        }
        resolve(filteredStudents);
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length === 0) {
            reject("no results");
            return;
        }
        resolve(dataCollection.courses);
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        const student = dataCollection.students.find(student => student.studentNum == num);
        if (!student) {
            reject("no results");
            return;
        }
        resolve(student);
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        const course = dataCollection.courses.find(course => course.courseId == id);
        if (!course) {
            reject("no results");
            return;
        }
        resolve(course);
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.studentNum = dataCollection.students.length + 1;
        studentData.TA = studentData.TA === "on";
        dataCollection.students.push(studentData);
        fs.writeFile("./data/students.json", JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject("unable to save student");
                return;
            }
            resolve();
        });
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        const index = dataCollection.students.findIndex(student => student.studentNum == studentData.studentNum);
        if (index === -1) {
            reject("student not found");
            return;
        }
        studentData.TA = studentData.TA === "on";
        dataCollection.students[index] = studentData;
        fs.writeFile("./data/students.json", JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject("unable to update student");
                return;
            }
            resolve();
        });
    });
};