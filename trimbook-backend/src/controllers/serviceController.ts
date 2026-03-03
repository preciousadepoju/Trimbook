import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Service } from '../models/Service';
import { User } from '../models/User';

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'barber') {
      res.status(403).json({ message: 'Only barbers can create services' });
      return;
    }

    const { title, duration, price, description, bestSeller } = req.body;
    
    if (!title || !duration || !price || !description) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const newService = new Service({
      barber: req.user.id,
      title,
      duration,
      price,
      description,
      bestSeller: bestSeller || false,
    });

    await newService.save();
    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error creating service' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'barber') {
      res.status(403).json({ message: 'Only barbers can update services' });
      return;
    }

    const { id } = req.params;
    const { title, duration, price, description, bestSeller } = req.body;

    const service = await Service.findOne({ _id: id, barber: req.user.id });
    if (!service) {
      res.status(404).json({ message: 'Service not found or unauthorized' });
      return;
    }

    if (title) service.title = title;
    if (duration) service.duration = duration;
    if (price) service.price = price;
    if (description) service.description = description;
    if (bestSeller !== undefined) service.bestSeller = bestSeller;

    await service.save();
    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error updating service' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'barber') {
      res.status(403).json({ message: 'Only barbers can delete services' });
      return;
    }

    const { id } = req.params;
    const service = await Service.findOneAndDelete({ _id: id, barber: req.user.id });

    if (!service) {
      res.status(404).json({ message: 'Service not found or unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error deleting service' });
  }
};

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Populate the barber's details, specifically name and location
    const services = await Service.find().populate('barber', 'name location avatarUrl portfolioImages avgRating reviewCount').sort('-createdAt');
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error fetching services' });
  }
};

export const getBarberServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId } = req.params;
    const services = await Service.find({ barber: barberId }).sort('-createdAt');
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching barber services:', error);
    res.status(500).json({ message: 'Server error fetching barber services' });
  }
};
