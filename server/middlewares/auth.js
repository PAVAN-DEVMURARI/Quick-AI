import { clerkClient, getAuth } from "@clerk/express";


//middleware to check userId and hasPremiumPlan
export const auth = async (req , res , next) => {
    try{
        console.log('Auth middleware called');
        const { userId, has } = getAuth(req);
        console.log('User ID from auth:', userId);
        
        if (!userId) {
            console.log('No user ID found in request');
            return res.json({success: false, message: 'Authentication required'});
        }

        const hasPremiumPlan = await has({plan : 'premium'} );
        console.log('Has premium plan:', hasPremiumPlan);

        const user = await clerkClient.users.getUser(userId);
        console.log('User metadata:', user.privateMetadata);

        if (!hasPremiumPlan && user.privateMetadata?.free_usage)
        {
            req.free_usage = user.privateMetadata.free_usage;
        }
        else
        {
            await clerkClient.users.updateUserMetadata(userId , {
                privateMetadata:{
                    free_usage: 0
                }
            })
            req.free_usage = 0;
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        req.auth = () => ({ userId }); // Add this for the controller
        
        console.log('Auth completed - Plan:', req.plan, 'Free usage:', req.free_usage);
        next();
    }
    catch(error)
    {
        console.error('Auth middleware error:', error);
        res.json({success: false, message: error.message})
    }
}

