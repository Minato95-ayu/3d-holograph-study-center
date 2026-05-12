import sympy as sp
import logging

logger = logging.getLogger("studo-simulation")

class SimulationService:
    def __init__(self):
        # Define symbolic variables
        self.r, self.h, self.density, self.velocity, self.mass = sp.symbols('r h density velocity mass')
        
        # Formulas
        self.volume_sphere = (4/3) * sp.pi * self.r**3
        self.volume_cylinder = sp.pi * self.r**2 * self.h
        self.mass_formula = self.volume_sphere * self.density # Default to sphere mass
        self.kinetic_energy = 0.5 * self.mass * self.velocity**2

    def run_experiment(self, shape_type: str, params: dict) -> dict:
        """
        Run a basic physics calculation based on user parameters.
        params can include: radius, height, density, velocity
        """
        try:
            logger.info(f"Running simulation for {shape_type} with params {params}")
            
            radius_val = params.get('radius', 1.0)
            height_val = params.get('height', 1.0)
            density_val = params.get('density', 7850) # default steel kg/m^3
            velocity_val = params.get('velocity', 0.0) # m/s
            
            results = {}
            calc_mass = 0.0
            
            if shape_type == 'sphere':
                vol = self.volume_sphere.subs(self.r, radius_val).evalf()
                calc_mass = (vol * density_val).evalf()
                results['Volume (m³)'] = round(float(vol), 4)
                results['Mass (kg)'] = round(float(calc_mass), 2)
            
            elif shape_type == 'cylinder':
                vol = self.volume_cylinder.subs({self.r: radius_val, self.h: height_val}).evalf()
                calc_mass = (vol * density_val).evalf()
                results['Volume (m³)'] = round(float(vol), 4)
                results['Mass (kg)'] = round(float(calc_mass), 2)
            
            # Kinetic Energy
            if velocity_val > 0:
                ke = self.kinetic_energy.subs({self.mass: calc_mass, self.velocity: velocity_val}).evalf()
                results['Kinetic Energy (J)'] = round(float(ke), 2)
                
            return {
                "success": True,
                "shape": shape_type,
                "calculations": results
            }
        except Exception as e:
            logger.error(f"Simulation error: {e}")
            return {"success": False, "error": str(e)}

simulation_service = SimulationService()
