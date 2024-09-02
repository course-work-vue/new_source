export default class Group {
    group_id;
    group_dir_id;
    group_prof_id;
    group_number;
    course;

    constructor(group) {
        this.group_id = group?.group_id ?? null;
        this.group_dir_id = group?.group_dir_id ?? null;
        this.group_prof_id = group?.group_prof_id ?? null;
        this.group_number = group?.group_number ?? null;
        this.course = group?.course ?? null;
    }
}
