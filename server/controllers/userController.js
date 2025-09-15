import sql from '../configs/db.js';

 export const getUser = async ( req , res ) => {
    try{
        const {userId} = req.auth();

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.json({success:true , creations})
    }
    catch(error)
    {
        res.json({success:false , message : error.message})
    }
 }


 //get the creations which have published as true

 export const getPublishedCreations = async ( req , res ) => {
    try{
        // First, let's see all creations to debug
        const allCreations = await sql`SELECT id, user_id, type, publish, created_at FROM creations ORDER BY created_at DESC LIMIT 10`;
        console.log('All recent creations:', allCreations);

        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        console.log('Published creations found:', creations.length);

        res.json({success:true , creations})
    }
    catch(error)
    {
        console.error('Error getting published creations:', error);
        res.json({success:false , message : error.message})
    }
 }


 //toggle like creations 
 export const toggleLikeCreation = async ( req , res ) => {
    try{
        console.log('Toggle like request received');
        const {userId} = req.auth();
        const {id} = req.body
        console.log('User ID:', userId, 'Creation ID:', id);

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

        if (!creation)
        {
            return res.json({success: false , message: 'Creation not found'})
        }

        const currentLikes = creation.likes;

        const userIdStr = userId.toString();

        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr))
        {
            updatedLikes = currentLikes.filter(id => id !== userIdStr);
            message = 'Unliked creation';
        }
        else
        {
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation Liked';
        }

        const formattedArray = `{${updatedLikes.join (',')}}`

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        res.json({success:true , message})
    }
    catch(error)
    {
        res.json({success:false , message : error.message})
    }
 }