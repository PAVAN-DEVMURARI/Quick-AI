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
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

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
        const {userId} = req.auth();
        const {id} = req.body

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