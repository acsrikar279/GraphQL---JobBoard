const db = require('./db')

const Query = {
    job: (root, {id}) => db.jobs.get(id),
    jobs: () => db.jobs.list(),
    company: (root, {id}) => db.companies.get(id)
};

const Mutation = {
    createJob: (root, {input}, {user}) => {
        //check user auth
        if(!user){
            throw new Error('Unauthorized Action');
        }
        const id =  db.jobs.create({...input, companyId: user.companyId});
        return db.jobs.get(id);
    }
};

const Job = {
    company: (job) => db.companies.get(job.companyId)
};

const Company = {
    jobs: (company) => db.jobs.list().filter((job) => job.companyId === company.id)
};

module.exports = {Query, Mutation, Company, Job}; 