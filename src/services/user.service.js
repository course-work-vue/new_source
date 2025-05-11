import axios from 'axios';
import authHeader from './auth-header';
const API_URL = 'https://ncatbird.ru/ums/containers/prod/server/api/Query/';

const API = 'https://ncatbird.ru/ums/containers/prod/server/api';

class UserService {
  getPublicContent() {
    return axios.get(API_URL + '"SuperHeroes"',{ headers: authHeader() } );
  }
/*
  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
*/

// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ STUDENTS
  getAllStudents(){
    
    return axios.get(API_URL+"students", { headers: authHeader() });
  }
  deleteStudentById(student_id){
    const apiUrl = `${API}/Students/${student_id}`;

    return axios.delete(apiUrl, { headers: authHeader() });
  }

  getAllFormattedStudents() {
    const apiUrl = `${API}/Students`; // Assuming the API endpoint for GET is /getStudent
    const headers = authHeader();
  
    return axios.get(apiUrl, { headers })
      .then(response => {
        if (response.data.length === 0) {
          // Handle empty response if needed
          return [];
        }
  
        // Perform formatting on the client side
        console.log(response.data);
        const formattedStudents = response.data.map(student => ({
          student_id: student.studentId,
          full_name: `${student.lastName} ${student.firstName} ${student.patronymic}`,
          group_name: `${student.group_number}/${student.subgroup || ''}`,
          group_number: student.group.groupNumber,
          subgroup: student.subgroup,
          formatted_enrolled_date: new Date(student.enrolled_date).toLocaleDateString('en-CA'),
          enrollment_order: student.enrollment_order,
          formatted_date_of_birth: new Date(student.date_of_birth).toLocaleDateString('en-CA'),
          course: student.course,
          group_id: student.group_id
        }));
        console.log(formattedStudents);
        return { data: formattedStudents };
      })
      .catch(error => {
        // Handle error if needed
        console.error("Error fetching formatted students:", error);
        throw error;
      });
  }
  getRetardsByGroupId(value){
    
    const query = {
      query: `SELECT sum(j.grade), s.last_name, s.first_name from journal j 
      JOIN groups g 
      ON g.group_id=j.group_id
      JOIN students s
      ON j.student_id=s.student_id
      group by j.student_id,s.last_name,s.first_name,g.group_number
      having 
      g.group_number='${value}'
	  order by sum(j.grade) ASC;
      `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });

  }
  getStudentById(studentId) {
    const apiUrl = `${API}/Students/${studentId}`; // Assuming the API endpoint for GET is /getStudentById/:studentId
    const headers = authHeader();
  
    return axios.get(apiUrl, { headers })
      .then(response => {
        if (!response.data) {
          // Handle empty response if needed
          return null;
        }
  
        // Perform formatting on the client side
        const formattedStudent = {
          student_id: response.data.studentId,
        first_name: response.data.firstName,
        last_name: response.data.lastName,
        patronymic: response.data.patronymic,
        gender: response.data.gender,
        passport_series_and_number: response.data.passportSeriesAndNumber,
        INN: response.data.inn,
        SNILS: response.data.snils,
        place_of_birth: response.data.placeOfBirth,
        email: response.data.email,
        student_login: response.data.studentLogin,
        enrollment_order: response.data.enrollmentOrder,
        group_id: response.data.groupId,
        subgroup: response.data.subgroup,
        zachetka_number: response.data.zachetkaNumber,
        phone_number: response.data.phoneNumber,
        phone_number_rod: response.data.phoneNumberRod,
          date_of_birth: new Date(response.data.dateOfBirth).toLocaleDateString('en-CA'),
          enrolled_date: new Date(response.data.enrolledDate).toLocaleDateString('en-CA'),
          isBudget:response.data.isBudget
        };
        console.log(formattedStudent);
        return { data: formattedStudent };

      })
      .catch(error => {
        // Handle error if needed
        console.error("Error fetching student by ID:", error);
        throw error;
      });
  }
  

  updateStudentById(studentId,first_name,last_name,patronymic,gender,date_of_birth,passport_series_and_number,INN,SNILS,place_of_birth,email,student_login,enrollment_order,enrolled_date, group_id,subgroup, zachetka_number, phone_number,phone_number_rod, isBudget){
    const apiUrl = `${API}/Students/${studentId}`;
    const formattedStudent = {
      studentId: studentId,
      firstName: first_name,
      lastName: last_name,
      patronymic: patronymic,
      gender: gender,
      dateOfBirth: date_of_birth,
      passportSeriesAndNumber: passport_series_and_number,
      INN: INN,
      SNILS: SNILS,
      placeOfBirth: place_of_birth,
      email: email,
      studentLogin: student_login,
      enrollmentOrder: enrollment_order,
      enrolledDate: enrolled_date,
      groupId: group_id,
      subgroup: subgroup,
      zachetkaNumber: zachetka_number,
      phoneNumber: phone_number,
      phoneNumberRod: phone_number_rod,
      isBudget: Boolean(isBudget)
    };
    
    return axios.put(apiUrl, formattedStudent, { headers: authHeader() });
  }
  
  addStudent(last_name,first_name,patronymic,gender,date_of_birth,passport_series_and_number,INN,SNILS,place_of_birth,email,student_login,enrollment_order,enrolled_date, group_id,subgroup,phone_number,phone_number_rod,zachetka_number){
    const apiUrl = `${API}/Students`;
    const formattedStudent = {

      lastName: last_name,
      firstName: first_name,
      patronymic: patronymic,
      gender: gender,
      dateOfBirth: date_of_birth,
      passportSeriesAndNumber: passport_series_and_number,
      INN: INN,
      SNILS: SNILS,
      placeOfBirth: place_of_birth,
      email: email,
      studentLogin: student_login,
      enrollmentOrder: enrollment_order,
      enrolledDate: enrolled_date,
      groupId: group_id,
      subgroup: subgroup,
      zachetkaNumber: zachetka_number,
      phoneNumber: phone_number,
      phoneNumberRod: phone_number_rod
    };

    return axios.post(apiUrl, formattedStudent, { headers: authHeader() });


  }
  getStudentsAsIdText(){
    const query = {
      query: `SELECT student_id AS id, 
      CONCAT_WS(' ',last_name, first_name,patronymic) AS text
      FROM "students" ORDER BY 
      text ASC;;`,
      };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getDepartamentsAsIdText(){
    const query = {
      query: `SELECT dep_id AS id, 
      dep_name AS text
      FROM "departaments" ORDER BY 
      text ASC;;`,
      };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getGroupsAsIdText(){
    const query = {
      query: `SELECT group_id AS id, group_number AS text
      FROM "groups" where deleted_at is null ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getGroupsAsKOSTIL(){
    const apiUrl = `${API}/Group`; // Assuming the API endpoint for GET is /getGroups
  const headers = authHeader();

  return axios.get(apiUrl, { headers })
    .then(response => {
      if (response.data.length === 0) {
        // Handle empty response if needed
        return [];
      }

      // Perform formatting on the client side
      console.log(response.data);
      const formattedGroups = response.data.map(group => ({
        id: group.groupNumber,
        text: group.groupNumber
      }));
      console.log(formattedGroups);
      return { data: formattedGroups };
    })
    .catch(error => {
      // Handle error if needed
      console.error("Error fetching formatted groups:", error);
      throw error;
    });
  }
  getProgramsAsIdText(){
    const query = {
      query: `SELECT id, program_name AS text
      FROM "programs" ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getPermissionByTable(tablename){
    const query = {
      query: `SELECT p.*, r."RoleName"
      FROM "Permissions" AS p
      INNER JOIN "Roles" AS r ON p."RoleId" = r."RoleId"
      WHERE p."TableName" = '${tablename}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }


// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ DIRECTIONS 
deleteDirectionById(direction_id){
  const apiUrl = `${API}/Direction/${direction_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}

getRestDirs(){
  return axios.get(`${API}/Direction`, { headers: authHeader() });
}

  getAllDirections(){
    const query = {
      query: `SELECT 
      d.dir_name,
      d.dir_code,
      COUNT(CASE WHEN s.is_budget = true THEN 1 END) AS total_budget_count,
      COUNT(CASE WHEN s.is_budget = false THEN 1 END) AS total_not_budget_count
  FROM
      directions d
  JOIN
      groups g ON d.dir_id = g.group_dir_id
  JOIN
      students s ON g.group_id = s.group_id
  GROUP BY
      d.dir_name, d.dir_code;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getDirectionById(id){
    const query = {
      query: `SELECT * from directions where 
      dir_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  addDirection(dir_name, dir_code) {
    const newDirection = {
        dirName: dir_name,
        dirCode: dir_code
    };

    return axios.post(`${API}/Direction`, newDirection, { headers: authHeader() })
        .then(response => {
            // Optionally handle the response from the server (e.g., get the created direction's ID)
            return response.data;
        })
        .catch(error => {
            console.error("Error adding direction:", error);
            throw error; 
        });
}


updateDirectionById(dir_id, dir_name, dir_code) {
  const updatedDirection = {
      dirId:dir_id,
      dirName: dir_name,
      dirCode: dir_code
  };

  return axios.put(`${API}/Direction/${dir_id}`, updatedDirection, { headers: authHeader() })
      .then(response => {
          // Optionally handle the response 
          return response.data;
      })
      .catch(error => {
          console.error("Error updating direction:", error);
          throw error; 
      });
}

getAllTeachGruz(){
  let fr = axios.get(API+"/TeachGruz", { headers: authHeader() })
  // console.log(fr);
  return fr;
}

getTeachGruzX(){
  const query = {
    query: `SELECT * from teach_gruz_x;`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

getQuery(q){
  const query = {
    query: q,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

getDisciples(){
  const query = {
    query: `SELECT * from import_disciples;`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

getPrograms_imp(){
  const query = {
    query: `SELECT * from import_programs;`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}


  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ SUBJECTS
  getAllSubjects(){
    const query = {
      query: `SELECT * from subjects;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  

  getSubjectById(id){
    const query = {
      query: `SELECT * from subjects where 
      subject_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  addSubject(subject_id, subject_name){
    const query = {
      query: `INSERT INTO "subjects" (
        "subject_id",
        "subject_name"
    ) VALUES (
        '${subject_id}',
        '${subject_name}'
    );`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  updateSubjectById(subject_id, subject_name){
    const query = {
      query: `"subject_name" = '${subject_name}',
  WHERE
      "subject_id" = '${subject_id}';`,
    };
    return axios.put(API_URL +"subjects", query, { headers: authHeader() });
  }

  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ TEACHERS
  getAllTeachers(){
    const query = {
      query: `SELECT * from teachers;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getTeachersForSubject(subject_id){
    const query = {
      query: `SELECT 
      t.teacher_id, 
      t.first_name, 
      t.last_name, 
      t.patronymic 
    FROM 
      "teachers" t 
    JOIN 
      "employment" e 
    ON 
      t.teacher_id = e.teacher_id 
    WHERE 
      e.subject_id = '${subject_id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getSubjectsForTeacher(teacher_id){
    const query = {
      query: `SELECT 
        g.group_number, 
        s.subject_name, 
        t.last_name 
      FROM 
        workload as w 
      JOIN 
        groups as g 
      ON 
        w.group_id = g.group_id 
      JOIN 
        subjects as s 
      ON 
        w.subject_id = s.subject_id 
      JOIN 
        teachers as t 
      ON 
        t.teacher_id = w.teacher_id 
      WHERE 
        w.teacher_id = '${teacher_id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getTeacherById(id){
    const query = {
      query: `SELECT * from teachers where 
      teacher_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  addTeacher(teacher_id, first_name, last_name, patronymic){
    const query = {
      query: `INSERT INTO "teachers" (
        "teacher_id",
        "first_name"
        "last_name"
        "patronymic"
    ) VALUES (
        '${teacher_id}',
        '${first_name}',
        '${last_name}',
        '${patronymic}'
    );`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  updateTeacherById(teacher_id, first_name, last_name, patronymic){
    const query = {
      query: `"first_name" = '${first_name}',
      "last_name" = '${last_name}',
      "patronymic" = '${patronymic}'
  WHERE
      "teacher_id" = '${teacher_id}';`,
    };
    return axios.put(API_URL +"teachers", query, { headers: authHeader() });
  }

  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ EMPLOYMENT
getAllEmployments(){
  const query = {
    query: `SELECT
    e.emp_id,
    e.teacher_id,
    t.first_name,
    t.last_name,
    t.patronymic,
    e.subject_id,
    s.subject_name   
  FROM 
    "employment" e
  JOIN
    "teachers" t
  ON
    t.teacher_id = e.teacher_id
  JOIN
    "subjects" s
  ON
    s.subject_id = e.subject_id  
    ;`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

getEmploymentById(id){
  const query = {
    query: `SELECT * from employment where 
    emp_id='${id}';`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

addEmployment(emp_id, teacher_id, subject_id){
  const query = {
    query: `INSERT INTO "employment" (
      "emp_id",
      "teacher_id"
      "subject_id"
  ) VALUES (
      '${emp_id}',
      '${teacher_id}',
      '${subject_id}'
  );`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

updateEmploymentById(emp_id, teacher_id, subject_id){
  const query = {
    query: `"teacher_id" = '${teacher_id}',
    "subject_id" = '${subject_id}'
WHERE
    "emp_id" = '${emp_id}';`,
  };
  return axios.put(API_URL +"teachers", query, { headers: authHeader() });
}


getAllWorkloads(){
  const query = {
    query: `SELECT * FROM workload`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

getWorkload(group_id){
  const query = {
    query: `SELECT * FROM workload
    WHERE
     "group_id" = '${group_id}'
    `,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}



editWorkload(wl_id, teacher_id, audtype){
  const query = {
    query: `UPDATE "workload"
    SET
      "teacher_id" = '${teacher_id}',
      "audtype" = '${audtype}'
    WHERE
      "wl_id" = '${wl_id}'
    ;`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}

addWorkload(group_id, subject_id, teacher_id){
  const query = {
    query: `INSERT INTO "workload" (
      "group_id",
      "subject_id",
      "teacher_id"
  ) VALUES (
      '${group_id}',
      '${subject_id}',
      '${teacher_id}'
  );`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}


// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ PROFILES

deleteProfileById(profile_id){
  const apiUrl = `${API}/Profile/${profile_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}
  getAllProfiles(){
    const query = {
      query: `SELECT
      p.prof_id,
      p.prof_name,
      d.dir_id,
      d.dir_name,
      d.dir_code
  FROM
      "profiles" p
  JOIN
      "directions" d ON p.prof_dir_id = d.dir_id
      ORDER BY 
      p.prof_name ASC;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getProfileById(id){
    const query = {
      query: `SELECT * from profiles where 
      prof_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  addProfile(prof_dir_id, prof_name) {
    const newProfile = {
        profDirId: prof_dir_id, 
        profName: prof_name
    };

    return axios.post(`${API}/Profile`, newProfile, { headers: authHeader() })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error adding profile:", error);
            throw error; 
        });
}

// updateProfileById
updateProfileById(prof_id, prof_dir_id, prof_name) {
    const updatedProfile = {
        profId: prof_id, // Include the ID in the update payload
        profDirId: prof_dir_id,
        profName: prof_name
    };

    return axios.put(`${API}/Profile/${prof_id}`, updatedProfile, { headers: authHeader() })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error updating profile:", error);
            throw error; 
        });
}
  getDirectionsAsIdText(){
    const query = {
      query: `SELECT dir_id AS id, dir_name, dir_code AS text
      FROM "directions" ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getProfilesAsIdText(){
    const query = {
      query: `SELECT prof_id AS id, prof_name AS text
      FROM "profiles" ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }


// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ GROUPS
deleteGroupById(group_id){
  const apiUrl = `${API}/Group/${group_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}

  getAllGroups(){
    
    return axios.get(API_URL + 'groups', { headers: authHeader() });
  }

  getGroupByDir(dir_id){
    const query = {
      query: `SELECT
      g.group_id,
      g.group_number,
      p.prof_name,
      d.dir_name,
      d.dir_code
  FROM
      "groups" AS g
  JOIN
      "profiles" AS p
  ON
      g.group_prof_id = p.prof_id
  JOIN
      "directions" AS d
  ON
      g.group_dir_id = d.dir_id 
  WHERE
      g.group_dir_id = '${dir_id}'    
      ;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getGroupById(id){
    const query = {
      query: `SELECT * from groups where 
      group_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  addGroup(group_dir_id, group_prof_id, group_number, course, magister) {
    const newGroup = {
      groupDirId: group_dir_id,
      groupProfId: group_prof_id,
      groupNumber: group_number,
      course: course,
      magister: Boolean(magister)
    };
  
    return axios.post(`${API}/Group`, newGroup, { headers: authHeader() })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.error("Error adding group:", error);
        throw error;
      });
  }
  
  // updateGroupById
  updateGroupById(group_id, group_dir_id, group_prof_id, group_number, course, magister) {
    const updatedGroup = {
      groupId: group_id,
      groupDirId: group_dir_id,
      groupProfId: group_prof_id,
      groupNumber: group_number,
      course: course,
      magister: Boolean(magister)
    };
  
    return axios.put(`${API}/Group/${group_id}`, updatedGroup, { headers: authHeader() })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.error("Error updating group:", error);
        throw error;
      });
  }
  deleteLgroupById(lg_id){
    const apiUrl = `${API}/LGroup/${lg_id}`;
  
    return axios.delete(apiUrl, { headers: authHeader() });
  }
  getAllLgroups(){
    const query = {
      query: `SELECT
      *, g.id as lg_id
  FROM
      "l_groups" AS g
      join programs p ON g.group_program_id=p.id;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  addLgroup(group_number,group_program_id,hours,start_date,end_date, people_count,table_data){

    let query0 = `
    INSERT INTO "l_groups" (
      "group_number",
      "group_program_id",
      "hours",
      "start_date",
      "end_date",
      "people_count"
  ) VALUES (
      '${group_number}',
      '${group_program_id}',
      '${hours}',
      '${start_date}',
      '${end_date}',
      '${people_count}'
  );
  `;


    table_data.forEach(entry => {
      query0 += `
      INSERT INTO "l_groups_day" (
          "day_id",
          "starttime",
          "endtime",
          "l_groups"
      ) VALUES (
          '${entry.day_id}',
          '${entry.starttime}',
          '${entry.endtime}',
          currval('l_groups_id_seq')
      );
      `;
  });


    const query = {
      query: query0,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  updateLgroupById(group_id,group_number,group_program_id,hours,start_date,end_date, people_count,table_data,table_new_rows){
    let query0 = `UPDATE l_groups SET
    "group_number" = '${group_number}',
      "group_program_id" = '${group_program_id}',
      "hours" = '${hours}',
      "start_date" = '${start_date}',
      "end_date" = '${end_date}',
      "people_count" = '${people_count}'
  WHERE
      "id" = '${group_id}';
    `;

    if(table_new_rows){
      query0+=`DELETE FROM l_groups_day WHERE l_groups='${group_id}';`
      table_data.forEach(entry => {
        query0 += `
        INSERT INTO "l_groups_day" (
            "day_id",
            "starttime",
            "endtime",
            "l_groups"
        ) VALUES (
            '${entry.day_id}',
            '${entry.starttime}',
            '${entry.endtime}',
            '${group_id}'
        );
        `;
    });
    }
    else{
    table_data.forEach(entry => {
      query0 += `
      UPDATE "l_groups_day" SET
          "day_id" ='${entry.day_id}',
          "starttime"='${entry.starttime}',
          "endtime"='${entry.endtime}'
    WHERE
          "l_groups_days_id"='${entry.l_groups_days_id}';
      `;
    });
  }
    const query = {
      query: query0,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getLgroupById(id){
    const query = {
      query: `SELECT *,TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date from l_groups where 
      id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getGDaysById(id){
    const query = {
      query: `SELECT * from 
      l_groups_day where l_groups='${id}'; `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }


  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ LISTENERS
deleteListenerById(l_id){
  const apiUrl = `${API}/Listener/${l_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}
  getAllListeners(){
    const query = {
      query: `SELECT
      *,
      CONCAT(l.lastname, ' ', l.name, ' ', l.surname) AS full_name,
      l.phone_number,
      l.email,
      l.id as list_id
     
  FROM
      "listeners" as l
      LEFT JOIN l_groups as lg ON l.group_id=lg.id;

      ;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getAllListenersWithoutGroup(){
    const query = {
      query: `SELECT
      *,
      CONCAT(l.lastname, ' ', l.name, ' ', l.surname) AS full_name, TO_CHAR(start_date , 'DD/MM/YYYY') AS start_date, TO_CHAR(end_date , 'DD/MM/YYYY') AS end_date,
      l.phone_number,
      l.email,
      l.id as list_id
     
  FROM
      "listeners" as l
      JOIN listener_wishes as lw ON l.id=lw.listener_id
      WHERE l.group_id IS NULL;

      ;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getListenerById(id){
    const query = {
      query: `SELECT *, TO_CHAR(issue_date , 'YYYY-MM-DD') AS issue_date,TO_CHAR(start_date , 'YYYY-MM-DD') AS start_date,TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date from 
      listeners join listener_wishes on listeners.id=listener_wishes.listener_id where 
      id='${id}'; `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getWishDaysById(id){
    const query = {
      query: `SELECT * from 
      l_wish_days where listener_id='${id}'; `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  addListener(name, surname,lastname, group_id,snils, passport, issued_by, issue_date, department_code, registration_address, phone_number, email, pc, hours,start_date, end_date,listener_id, wish_description, table_data){


    let query0 = `
    INSERT INTO "listeners" (
      "name",
      "surname",
      "lastname",
      group_id,
      "snils",
      "passport",
      "issued_by",
      "issue_date",
      "department_code",
      "registration_address",
      "phone_number",
      "email"
    ) VALUES (
      '${name}',
      '${surname}',
      '${lastname}',
      ${group_id},
      '${snils}',
      '${passport}',
      '${issued_by}',
      '${issue_date}',
      '${department_code}',
      '${registration_address}',
      '${phone_number}',
      '${email}'
    ) RETURNING id;

    INSERT INTO "listener_wishes" (
      "people_count",
      "hours",
      start_date,
      "end_date",
      "listener_id",
      "wish_description"
    ) VALUES (
      '${pc}',
      '${hours}',
      '${start_date}',
      '${end_date}',
      currval('listeners_id_seq'),
      '${wish_description}'
    );
  `;

  console.log(table_data);
  table_data.forEach(entry => {
    query0 += `
    INSERT INTO "l_wish_days" (
        "day_id",
        "starttime",
        "endtime",
        "listener_id"
    ) VALUES (
        '${entry.day_id}',
        '${entry.starttime}',
        '${entry.endtime}',
        currval('listeners_id_seq')
    );
    `;
});

const query = {
  query:query0
};
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  addListenerWishes(pc, hours,start_date, end_date,listener_id, wish_description, suitable_days){


    const query = {
      query: `INSERT INTO "listener_wishes" (
        "people_count",
        "hours",
        "lastname",
        start_date,
        "end_date",
        "listener_id",
        "wish_description",
        "suitable_days"
    ) VALUES (
        '${pc}',
        '${hours}',
        '${start_date}',
        '${end_date}',
        '${listener_id}',
        '${wish_description}',
        ARRAY['${suitable_days}']
    );`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  updateListenerById(id, name, surname,lastname, group_id, snils, passport, issued_by, issue_date, department_code, registration_address, phone_number, email,
    pc, hours,start_date, end_date, wish_description, table_data, table_new_rows){



 let query0 = `UPDATE listeners SET
 "name" ='${name}',
"surname" ='${surname}',
"lastname"=  '${lastname}',
"group_id"=  ${group_id},
"snils"= '${snils}',
"passport"= '${passport}',
"issued_by"= '${issued_by}',
"issue_date"='${issue_date}',
"department_code"='${department_code}',
"registration_address"='${registration_address}',
"phone_number"='${phone_number}',
"email"='${email}'
WHERE
"id" = '${id}';

UPDATE listener_wishes SET
 "people_count" ='${pc}',
"hours" ='${hours}',
"start_date"=  '${start_date}',
"end_date"=  '${end_date}',
"wish_description"= '${wish_description}'
WHERE
"listener_id" = '${id}';


`;
if(table_new_rows){
  query0+=`DELETE FROM l_wish_days WHERE listener_id='${id}';`;
  table_data.forEach(entry => {
    query0 += `
    INSERT INTO "l_wish_days" (
        "day_id",
        "starttime",
        "endtime",
        "listener_id"
    ) VALUES (
        '${entry.day_id}',
        '${entry.starttime}',
        '${entry.endtime}',
        '${id}'
    );
    `
});
}
else{

table_data.forEach(entry => {
  query0 += `
  UPDATE "l_wish_days" SET
      "day_id" ='${entry.day_id}',
      "starttime"='${entry.starttime}',
      "endtime"='${entry.endtime}'
WHERE
      "l_wish_day_id"='${entry.l_wish_day_id}';
  `;
});
}
const query = {
  query:query0
};

    return axios.post(API_URL, query, { headers: authHeader() });
  }

  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ CONTRACTS

deleteContractById(c_id){
  const apiUrl = `${API}/Contract/${c_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}
  getAllContracts(){
    const query = {
      query: `SELECT 
      *,
      contracts.id AS contract_id,
      listeners.id AS listener_id,
      CONCAT(listeners.lastname, ' ', listeners.name, ' ', listeners.surname) AS listener_full_name,
      listeners.snils AS listener_snils,
      listeners.passport AS listener_passport,
      listeners.issued_by AS listener_issued_by,
      listeners.issue_date AS listener_issue_date,
      listeners.department_code AS listener_department_code,
      listeners.registration_address AS listener_registration_address,
      listeners.phone_number AS listener_phone_number,
      listeners.email AS listener_email,
      payers.id AS payer_id,
      CONCAT(payers.lastname, ' ', payers.name, ' ', payers.surname) AS payer_full_name,
      payers.snils AS payer_snils,
      payers.passport AS payer_passport,
      payers.issued_by AS payer_issued_by,
      payers.issue_date AS payer_issue_date,
      payers.department_code AS payer_department_code,
      payers.registration_address AS payer_registration_address,
      payers.phone_number AS payer_phone_number,
      payers.email AS payer_email,
      programs.program_name,
      contracts.contr_number,
      contracts.id,TO_CHAR(listeners.issue_date, 'DD/MM/YYYY') AS listener_issue_date,
      TO_CHAR(start_date, 'DD/MM/YYYY') AS start_date,
      TO_CHAR(end_date, 'DD/MM/YYYY') AS end_date,
      TO_CHAR(date_enroll, 'DD/MM/YYYY') AS date_enroll,
      TO_CHAR(date_kick, 'DD/MM/YYYY') AS date_kick
  FROM 
      contracts
  JOIN
      listeners ON contracts.listener_id = listeners.id
  JOIN
      payers ON contracts.payer_id = payers.id
  JOIN
      programs ON contracts.program_id = programs.id;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getContractById(id){
    const query = {
      query: `SELECT * from contracts where 
      id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
// addContract
addContract(listener_id, payer_id, contr_number, program_id, cert_date, listened_hours, date_enroll, date_kick, group_to_move) {
  const newContract = {
    listenerId: listener_id,
    payerId: payer_id,
    contrNumber: contr_number, 
    programId: program_id,
    certDate: cert_date,
    listenedHours: listened_hours,
    dateEnroll: date_enroll,
    dateKick: date_kick, // No need for the null check, JSON handles it
    groupToMove: group_to_move
  };

  return axios.post(`${API}/Contract`, newContract, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error adding contract:", error);
      throw error;
    });
}

// updateContractById
updateContractById(id, listener_id, payer_id, contr_number, program_id) {
  const updatedContract = {
    id: id, // Include the ID for update
    listenerId: listener_id,
    payerId: payer_id,
    contrNumber: contr_number,
    programId: program_id
  };

  return axios.put(`${API}/Contract/${id}`, updatedContract, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error updating contract:", error);
      throw error;
    });
}

  getPayersAsIdText(){
    const query = {
      query: `SELECT id AS id, CONCAT(lastname, ' ', name, ' ', surname) AS text
      FROM "payers" ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getLgroupsAsIdText(){
    const query = {
      query: `SELECT id AS id, group_number AS text
      FROM "l_groups" ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getListenersAsIdText(){
    const query = {
      query: `SELECT id AS id, CONCAT(lastname, ' ', name, ' ', surname) AS text
      FROM "listeners" ORDER BY 
      text ASC;`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getStudentsCount(id){
    const query = {
      query: `select count(students.*) from students
where group_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ COURSE_WORK
deleteCwById(cw_id){
  const apiUrl = `${API}/CourseWork/${cw_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}
  getAllCws(){
    const query = {
      query: `SELECT
      cw.course_work_id,
      cw.course_work_teacher_id,
      cw.course_work_theme,
      cw.course_work_student_id,
      cw.course_work_kafedra,
      CONCAT(s.last_name, ' ', s.first_name, ' ', s.patronymic) AS full_name,
      s.gender AS student_gender,
      s.date_of_birth AS student_date_of_birth,
      s.passport_series_and_number AS student_passport,
      s."INN" AS student_INN,
      s."SNILS" AS student_SNILS,
      s.place_of_birth AS student_place_of_birth,
      s.email AS student_email,
      s.student_login AS student_login,
      s.enrollment_order AS student_enrollment_order,
      s.enrolled_date AS student_enrolled_date,
      s.course AS student_course,
      s.group_id AS student_group_id,
      s.subgroup AS student_subgroup,
      d.dep_name,
      CONCAT(t.last_name, ' ', t.first_name, ' ', t.patronymic) AS full_name_t
  FROM
      course_work cw
  JOIN
      students s ON cw.course_work_student_id = s.student_id
  JOIN
      departaments d ON cw.course_work_kafedra=d.dep_id
  JOIN
      teachers t ON cw.course_work_teacher_id=t.teacher_id;
  
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getCwById(id){
    const query = {
      query: `SELECT * from course_work where 
      course_work_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  // addCw
addCw(course_work_theme, course_work_teacher_id, course_work_student_id, course_work_kafedra, course_work_vipysk, course_work_year, course_work_ocenka) {
  const newCw = {
    courseWorkTheme: course_work_theme,
    courseWorkTeacherId: course_work_teacher_id,
    courseWorkStudentId: course_work_student_id,
    courseWorkKafedra: course_work_kafedra,
    courseWorkVipysk: Boolean(course_work_vipysk),
    courseWorkYear: course_work_year,
    courseWorkOcenka: course_work_ocenka
  };

  return axios.post(`${API}/CourseWork`, newCw, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error adding course work:", error);
      throw error;
    });
}

// updateCwById
updateCwById(id, course_work_theme, course_work_teacher_id, course_work_student_id, course_work_kafedra, course_work_vipysk, course_work_year, course_work_ocenka) {
  const updatedCw = {
    courseWorkId: id, 
    courseWorkTheme: course_work_theme,
    courseWorkTeacherId: course_work_teacher_id,
    courseWorkStudentId: course_work_student_id,
    courseWorkKafedra: course_work_kafedra,
    courseWorkVipysk: Boolean(course_work_vipysk),
    courseWorkYear: course_work_year,
    courseWorkOcenka: course_work_ocenka
  };

  return axios.put(`${API}/CourseWork/${id}`, updatedCw, { headers: authHeader() }) 
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error updating course work:", error);
      throw error;
    });
}
  
// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ PAYERS
  getAllPayers(){
    const query = {
      query: `SELECT
      CONCAT(lastname, ' ', name, ' ', surname) AS full_name,
      phone_number,
      email,
      id
  FROM
      payers;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getPayerById(id){
    const query = {
      query: `SELECT *, TO_CHAR(issue_date , 'YYYY-MM-DD') AS issue_date from payers where 
      id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  deletePayerById(p_id){
    const apiUrl = `${API}/Payer/${p_id}`;
  
    return axios.delete(apiUrl, { headers: authHeader() });
  }
 // addPayer
addPayer(name, surname, lastname, snils, passport, issued_by, issue_date, department_code, registration_address, phone_number, email) {
  const newPayer = {
    name: name,
    surname: surname,
    lastname: lastname,
    snils: snils,
    passport: passport,
    issuedBy: issued_by, // camelCase for consistency
    issueDate: issue_date,
    departmentCode: department_code,
    registrationAddress: registration_address,
    phoneNumber: phone_number,
    email: email
  };

  return axios.post(`${API}/Payer`, newPayer, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error adding payer:", error);
      throw error;
    });
}

// updatePayerById
updatePayerById(id, name, surname, lastname, snils, passport, issued_by, issue_date, department_code, registration_address, phone_number, email) {
  const updatedPayer = {
    id: id,  // Include the ID in the update object
    name: name,
    surname: surname,
    lastname: lastname,
    snils: snils,
    passport: passport,
    issueDate: issue_date,
    departmentCode: department_code,
    registrationAddress: registration_address,
    phoneNumber: phone_number,
    email: email
  };

  return axios.put(`${API}/Payer/${id}`, updatedPayer, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error updating payer:", error);
      throw error;
    });
}

  getAllCourses(){
    const query = {
      query: `SELECT
      c.course_id,
      c.course,
      c.group_id,
      g.group_number
  FROM
      "courses" c
  JOIN
      "groups" g ON c.group_id = g.group_id
      ORDER BY 
      c.course ASC;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  

  getCourseById(id){
    const query = {
      query: `SELECT * from courses where 
      course_id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  addCourse(course, group_id){
    const query = {
      query: `INSERT INTO "courses" (
        "course",
        "group_id"
    ) VALUES (
        '${course}',
        '${group_id}'
    );`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  updateCourseById(course_id,course,group_id){
    const query = {
      query: `"course" = '${course}',
      "group_id" = '${group_id}'
  WHERE
      "course_id" = '${course_id}';`,
    };
    return axios.put(API_URL +"courses", query, { headers: authHeader() });
  }



// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ PROGRAMS

deleteProgramById(p_id){
  const apiUrl = `${API}/Program_u/${p_id}`;

  return axios.delete(apiUrl, { headers: authHeader() });
}
  getAllPrograms(){
    const query = {
      query: `SELECT
      id,
      required_amount,
      program_name,
      hours,
      TO_CHAR(start_date , 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date , 'YYYY-MM-DD') AS end_date
  FROM
    programs;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getProgramById(id){
    const query = {
      query: `SELECT *, TO_CHAR(start_date , 'YYYY-MM-DD') AS start_date, TO_CHAR(end_date , 'YYYY-MM-DD') AS end_date from programs where 
      id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

// addProgram
// addProgram
addProgram(required_amount, program_name, hours, start_date, end_date) {
  const newProgram = {
    requiredAmount: required_amount, 
    programName: program_name,
    hours: hours,
    startDate: start_date, 
    endDate: end_date
  };

  return axios.post(`${API}/Program_u`, newProgram, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error adding program:", error);
      throw error;
    });
}

// updateProgramById
updateProgramById(id, required_amount, program_name, hours, start_date, end_date) {
  const updatedProgram = {
    id: id, // Include ID for updating
    requiredAmount: required_amount,
    programName: program_name,
    hours: hours,
    startDate: start_date,
    endDate: end_date
  };

  return axios.put(`${API}/Program_u/${id}`, updatedProgram, { headers: authHeader() })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error updating program:", error);
      throw error;
    });
}
  deletePaymentById(p_id){
    const apiUrl = `${API}/PayGraph/${p_id}`;

    return axios.delete(apiUrl, { headers: authHeader() });
  }
  getPaymentById(id){
    const query = {
      query: `SELECT *, TO_CHAR(date_40 , 'YYYY-MM-DD') AS date_40, TO_CHAR(expiration_date , 'YYYY-MM-DD') AS expiration_date from pay_graph where 
      id='${id}';`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  


// ВЗАИМОДЕЙСТВИЕ С ТАБЛИЦЕЙ PAY_GRAPH   
  getAllPayments(){
    const query = {
      query: `SELECT
      p.id, c.contr_number, TO_CHAR(expiration_date, 'DD/MM/YYYY') AS expiration_date, TO_CHAR(date_40, 'DD/MM/YYYY') AS date_40 from pay_graph p
      JOIN contracts c ON p.contract_id=c.id;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }


  //Аудитории
  getAuditAsIdText(){
    const query = {
      query: `SELECT aud_id AS id, number AS text, type, count
      FROM "auditorium";`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getSubjectAsIdText(){
    const query = {
      query: `SELECT subject_id AS id, subject_name AS text
      FROM "subjects";`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getContractsAsIdText(){
    const query = {
      query: `SELECT id AS id, contr_number AS text
      FROM "contracts";`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  getTeachersAsIdText(){
    const query = {
      query: `SELECT teacher_id AS id, 
      CONCAT_WS(' ',last_name, first_name,patronymic) AS text
      FROM "teachers" ORDER BY 
      text ASC;;`,
      };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  // updatePaymentById
updatePaymentById(id, contract_id, expiration_date, date_40, all_sum, deposited_amount, left_to_pay, bank) {
  const updatedPayment = {
    id: id, // Include the ID for updating
    contractId: contract_id, 
    expirationDate: expiration_date,
    date40: date_40, // Assuming this is a date field, use camelCase
    allSum: all_sum, 
    depositedAmount: deposited_amount,
    leftToPay: left_to_pay, 
    bank: bank
  };

  return axios.put(`${API}/PayGraph/${id}`, updatedPayment, { headers: authHeader() }) 
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error updating payment:", error);
      throw error;
    });
}

// addPayment
addPayment(contract_id, expiration_date, date_40, all_sum, deposited_amount, left_to_pay, bank) {
  const newPayment = {
    contractId: contract_id,
    expirationDate: expiration_date,
    date40: date_40, 
    allSum: all_sum,
    depositedAmount: deposited_amount,
    leftToPay: left_to_pay,
    bank: bank
  };

  return axios.post(`${API}/PayGraph`, newPayment, { headers: authHeader() }) 
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error adding payment:", error);
      throw error;
    });
}

  getPaymentsAsIdText(){
    const query = {
      query: `SELECT id, contr_number AS text
      FROM "contracts" ORDER BY 
      text ASC;`,

    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }


 getDaysAsIdText(){
    const query = {
      query: `SELECT day_id AS id, dayofweek AS text
      FROM "days";`,
    };
    
    return axios.post(API_URL, query, { headers: authHeader() });
  }

    

    assignAuditoriumToSchedule(lesson_id, aud_id){
      const query = {
        query: `
      "aud_id" = '${aud_id}'
      WHERE
      "lesson_id" = '${lesson_id}';
        `,
      };
      return axios.put(API_URL+"teachschedule", query, { headers: authHeader() });
    }


  

  getTeachSchedule(group_id) {
    const query = {
      query: `SELECT
    ts.lesson_id, 
    ts.wl_id,
    CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name, 
    s.subject_name,
    ts.time,
    ts.day_id,
    g.group_number,
    a.number
    FROM 
        teachschedule ts
    JOIN 
        workload wl ON ts.wl_id = wl.wl_id
    JOIN 
        teachers t ON wl.teacher_id = t.teacher_id
    JOIN 
        subjects s ON wl.subject_id = s.subject_id
    JOIN 
        groups g ON wl.group_id = g.group_id
    JOIN 
        days d ON ts.day_id = d.day_id
    LEFT JOIN
        auditorium a ON ts.aud_id = a.aud_id
    WHERE 
        g.group_id = '${group_id}'
    
    ;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getGroupSchedule(teacher_id) {
    const query = {
      query: `SELECT 
    ts.lesson_id, 
    ts.wl_id,
    CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name, 
    s.subject_name,
    ts.time,
    ts.day_id,
    g.group_number,
    a.number
    FROM 
        teachschedule ts
    JOIN 
        workload wl ON ts.wl_id = wl.wl_id
    JOIN 
        teachers t ON wl.teacher_id = t.teacher_id
    JOIN 
        subjects s ON wl.subject_id = s.subject_id
    JOIN 
        groups g ON wl.group_id = g.group_id
    JOIN 
        days d ON ts.day_id = d.day_id
    LEFT JOIN
        auditorium a ON ts.aud_id = a.aud_id
    WHERE 
        t.teacher_id = '${teacher_id}'
    
    ;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getGroupByDirAndCourse(dir_id, course){
    const query = {
      query: `SELECT
      g.group_id,
      g.group_number
  FROM
      groups AS g
  
  WHERE
      g.group_dir_id = '${dir_id}'  AND course = '${course}' AND g.deleted_at is null  
      ;
  `,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getWorkloadByGroupIds(groupIds) {
    const ids = groupIds.map(id => `'${id}'`).join(',');
    const query = {
      query: `
        SELECT w.wl_id,
        w.group_id, 
        s.subject_name,
        w.teacher_id, 
        CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name,
        g.group_number
        FROM workload w
        JOIN subjects s ON w.subject_id = s.subject_id
        JOIN teachers t ON w.teacher_id = t.teacher_id
        JOIN groups g ON w.group_id = g.group_id
        WHERE w.group_id IN (${ids})
      `
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  assignLesson({ wl_id, day_id, time }) {
    const query = {
      query: `INSERT INTO teachschedule (
        wl_id,
        day_id,
        time
      ) VALUES (
        '${wl_id}',
        '${day_id}',
        '${time}'
      );`
    };
  
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  deleteLesson(lesson_id) {
    const query = {
      query: `DELETE FROM teachschedule 
              WHERE lesson_id = '${lesson_id}';`
    };
  
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  saveTeachers(name) {
    const query = {
      query: `INSERT INTO "teachers" (
        "first_name",
        "last_name",
        "patronymic"
        ) 
        VALUES
        ${name}
    ;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getTeachSchedule(group_id) {
    const query = {
      query: `SELECT 
    CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name, 
    s.subject_name,
    ts.time,
    ts.day_id,
    g.group_number
    FROM 
        teachschedule ts
    JOIN 
        workload wl ON ts.wl_id = wl.wl_id
    JOIN 
        teachers t ON wl.teacher_id = t.teacher_id
    JOIN 
        subjects s ON wl.subject_id = s.subject_id
    JOIN 
        groups g ON wl.group_id = g.group_id
    JOIN 
        days d ON ts.day_id = d.day_id
    WHERE 
        g.group_id = '${group_id}'
    
    ;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }

  getGroupSchedule(teacher_id) {
    const query = {
      query: `SELECT 
    CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name, 
    s.subject_name,
    ts.time,
    ts.day_id,
    g.group_number
    FROM 
        teachschedule ts
    JOIN 
        workload wl ON ts.wl_id = wl.wl_id
    JOIN 
        teachers t ON wl.teacher_id = t.teacher_id
    JOIN 
        subjects s ON wl.subject_id = s.subject_id
    JOIN 
        groups g ON wl.group_id = g.group_id
    JOIN 
        days d ON ts.day_id = d.day_id
    WHERE 
        t.teacher_id = '${teacher_id}'
    
    ;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }



	//ЖУРНАЛ

  saveTeachers(name) {
    const query = {
      query: `INSERT INTO "teachers" (
        "first_name",
        "last_name",
        "patronymic"
        ) 
        VALUES
        ${name}
    ;`,
    };
    return axios.post(API_URL, query, { headers: authHeader() });
  }
  
deleteTegrsuById(tegrsu_id){
  const query = {
    query: `DELETE FROM tegrsus where "tegrsu_id" = '${tegrsu_id}'`,
  };

  return axios.post(API_URL, query, { headers: authHeader() });
}

/*getAllStudentss(){
  const query = {
    query: `SELECT 
	s.student_id,
	CONCAT_WS(' ', s.last_name, s.first_name, s.patronymic) AS full_name,
	g.group_number
    FROM students AS s
JOIN
 groups AS g
ON 
 s.group_id=g.group_id;`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}*/

getTegrsusAsIdText(){
  const query = {
    query: `SELECT 
	t.tegrsu_id,
	t.tegrsu_teacher_id,
	t.tegrsu_group_id,
	g.group_number AS text
    FROM "tegrsus" AS t
JOIN
	groups AS g
ON
t.tegrsu_group_id=g.group_id;`,
  };
  
  return axios.post(API_URL, query, { headers: authHeader() });
}

getAllTegrsus(){
  const query = {
    query: `SELECT
    te.tegrsu_id,
    t.teacher_id,
    gr.group_id,
    gr.group_number,
    s.subject_id,
    CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name_teacher,
    s.subject_name
FROM
    "tegrsus" AS te
JOIN
    "teachers" AS t
ON
    te.tegrsu_teacher_id = t.teacher_id
JOIN
    "groups" AS gr
ON
    te.tegrsu_group_id = gr.group_id

JOIN
    "subjects" AS s
ON
    te.tegrsu_subject_id = s.subject_id;
`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}



updateTegrsuById(tegrsuId,tegrsu_teacher_id,tegrsu_group_id,tegrsu_subject_id){
  const query = {
    query: `"tegrsu_teacher_id" = '${tegrsu_teacher_id}',
    "tegrsu_group_id" = '${tegrsu_group_id}',
    "tegrsu_subject_id" = '${tegrsu_subject_id}'
    
WHERE
    "tegrsu_id" = '${tegrsuId}';`,
  };
  
  return axios.put(API_URL+"tegrsus", query, { headers: authHeader() });
}

addTegrsu(tegrsu_teacher_id,tegrsu_group_id,tegrsu_subject_id){
  const query = {
    query: `INSERT INTO "tegrsus" (
      "tegrsu_teacher_id",
      "tegrsu_group_id",
      "tegrsu_subject_id"
  ) VALUES (
      '${tegrsu_teacher_id}',
      '${tegrsu_group_id}',
      '${tegrsu_subject_id}'
  );`,
  };

  return axios.post(API_URL, query, { headers: authHeader() });


}
getTegrsuById(id){
  const query = {
    query: `SELECT * from tegrsus where 
    tegrsu_id='${id}';`,
  };
  return axios.post(API_URL, query, { headers: authHeader() });
}
getAllJournals(){
  const query = {
    query: `select 
j.j_id,
j.date,
j.gradekr,
j.gradekol,
j.gradekr2,
j.gradekol2,
j.grade,
j.status,
j.grade2,
j.status2,
j.teacher_id,
j.subject_id,
s.student_id,
g.group_id,
CONCAT_WS(' ', j.date) AS date,
CONCAT_WS(' ', su.subject_name) AS subject_name,
CONCAT_WS(' ', s.last_name, s.first_name, s.patronymic) AS full_name,
CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name_teacher,
CONCAT_WS('/', g.group_number, NULLIF(s.subgroup, '')) AS group_name,
g.group_number
from 
  journal as j 
join 
  students as s
on 
  j.student_id=s.student_id
join
    groups as g
on
  j.group_id=g.group_id
join
  teachers as t
on
j.teacher_id=t.teacher_id
join
    subjects as su
on
  j.subject_id=su.subject_id
`,

  };

  return axios.post(API_URL, query, { headers: authHeader() });
}

getTeacherByJournal(){
  const query = {
    query: `select 
    j.j_id,
j.teacher_id,
s.student_id,
j.subject_id,
j.group_id,
CONCAT_WS(' ', su.subject_name) AS subject_name,
CONCAT_WS(' ', t.last_name, t.first_name, t.patronymic) AS full_name_teacher
from 
  journal as j 
join 
  students as s
on 
  j.student_id=s.student_id
join
  teachers as t
on
  j.teacher_id=t.teacher_id
join 
    subjects as su
on
    j.subject_id=su.subject_id
join
	groups as g
on 
	j.group_id=g.group_id
`,

};
return axios.post(API_URL, query, { headers: authHeader() });
}


/*updateJournal(j_id, date, grade, status, teacher_id, subject_id, student_id, group_id) {
  const apiUrl = `${API}/journal/${j_id}`;
  const formattedJournal = {
    date: date,
    grade: grade,
    status: status,
    teacherId: teacher_id,
    subjectId: subject_id,
    studentId: student_id,
    groupId: group_id
  };

  return axios.put(apiUrl, formattedJournal, { headers: authHeader() });
}*/
updateJournalById(j_id, status,grade,gradekr,gradekol,status2, grade2) {
  const query = {
    query: ` UPDATE "journal"
    SET
        "status"='${status}',
        "grade" = ${grade},
        "gradekr" = ${gradekr},
        "gradekol" = ${gradekol},
        "status2"='${status2}',
        "grade2" = ${grade2}
        
    WHERE
      "j_id" = '${j_id}';`,
  };

  return axios.post(API_URL, query, { headers: authHeader() });
}


}

export default new UserService();
