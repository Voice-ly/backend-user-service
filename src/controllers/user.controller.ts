import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { sign, SignOptions } from "jsonwebtoken";
import { User } from "../models/user.model";
import {adminAuth} from "../config/firebaseAdmin";
import {
  createUserService,
  getUsersService,
  updateUserService,
  deleteUserService,
  findUserByEmailService,
} from "../services/user.service";

// Extiende User para incluir el ID de Firestore
interface UserWithId extends User {
  id: string;
}

/**
 * Creates a new user in the system.
 *
 * This controller handles the creation of a user by validating the request data,
 * checking if the email already exists, enforcing password rules, hashing the
 * password, and saving the user into the database.
 *
 * @param {Request} req - Express request object containing the user data in the body.
 * @param {Response} res - Express response object used to send the API response.
 * @returns {Promise<Response>} Returns a JSON response with the created user ID or an error message.
 *
 * @throws Will return a 500 status code if an unexpected error occurs.
 */

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName || !age) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluir letra mayúscula, minúscula y un caracter especial",
      });
    }

    // Validar si el usuario ya existe
    const existingUser = await findUserByEmailService(email);
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Crear usuario
    const userData: User = {
      firstName,
      lastName,
      age,
      email,
      password,
      createdAt: new Date(),
    };

    const id = await createUserService(userData);

    res.status(201).json({ id, message: "Usuario creado correctamente" });
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Retrieves all users from the system.
 *
 * This controller fetches all registered users by calling the user service layer.
 * It returns a JSON array with the users or an error message if something fails.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send the response.
 * @returns {Promise<Response>} Returns a JSON response containing the list of users or an error message.
 *
 * @throws Will return a 500 status code if an unexpected error occurs.
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsersService();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Updates an existing user in the system.
 *
 * This controller receives the user ID through the request parameters and the
 * updated data in the request body. If a password update is included, the password
 * is hashed before being saved. The service layer is then called to perform
 * the update in the database.
 *
 * @param {Request} req - Express request object containing the user ID and updated data.
 * @param {Response} res - Express response object used to send the response.
 * @returns {Promise<Response>} Returns a JSON response confirming the update or an error message.
 *
 * @throws Will return a 500 status code if an unexpected error occurs.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Token inválido" });

    const userId = req.user.uid;
    const data = req.body;

    // Si se intenta actualizar la contraseña, la encriptamos
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await updateUserService(userId, data);

    res.json({ message: "Usuario actualizado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deletes a user from the system.
 *
 * This controller receives a user ID from the request parameters and calls the
 * service layer to remove the corresponding user from the database.
 *
 * @param {Request} req - Express request object containing the user ID in the URL parameters.
 * @param {Response} res - Express response object used to send the response.
 * @returns {Promise<Response>} Returns a JSON response confirming deletion or an error message.
 *
 * @throws Will return a 500 status code if an unexpected error occurs.
 */

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Token inválido" });

    const userId = req.user.uid; // Usamos el UID del token
    await deleteUserService(userId);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controlador para iniciar sesión utilizando autenticación JWT.
 * 
 * Este endpoint valida las credenciales del usuario, verifica la contraseña 
 * utilizando bcrypt y genera un token JWT firmado con una clave secreta.
 * 
 * @param req - Objeto Request de Express, debe incluir `email` y `password` en el body.
 * @param res - Objeto Response de Express utilizado para enviar la respuesta al cliente.
 * 
 * @returns Devuelve un token JWT si las credenciales son válidas.
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email y contraseña requeridos" });

    const user = await findUserByEmailService(email) as UserWithId | null;
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Contraseña incorrecta" });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no definido");

    const expiresIn: any = process.env.JWT_EXPIRES_IN || "1h";
    const options: SignOptions = { expiresIn };

    const token = sign(
        { uid: user.id, email: user.email },
        secret,
        options
    );
    

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
