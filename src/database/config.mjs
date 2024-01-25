import mongoose from 'mongoose';
import logger from '../utils/logger.mjs';

const dbConnection = async () => {

    try {

        await mongoose.connect(process.env.DB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logger.log(
            {
                level: 'mongodb',
                message: `DB Online`
            }
        );

    } catch (error) {

        logger.log(
            {
                level: 'mongodb',
                message: `Error a la hora de inicializar BD ${error}`
            }
        );
        
        throw new Error('Error a la hora de inicializar BD');
    }

}

export default dbConnection;