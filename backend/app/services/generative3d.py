import trimesh
import base64
import logging
import io

logger = logging.getLogger("studo-generative3d")

class Generative3DService:
    def generate_shape(self, shape_type: str, params: dict) -> dict:
        """
        Generate a parameterized 3D mesh using trimesh.
        Returns base64 encoded GLB data.
        """
        try:
            radius = params.get('radius', 1.0)
            height = params.get('height', 1.0)
            
            logger.info(f"Generating 3D model: {shape_type} with r={radius}, h={height}")
            
            mesh = None
            if shape_type == 'sphere':
                mesh = trimesh.creation.icosphere(radius=radius, subdivisions=3)
            elif shape_type == 'cylinder':
                mesh = trimesh.creation.cylinder(radius=radius, height=height)
            elif shape_type == 'box':
                mesh = trimesh.creation.box(extents=[radius, height, radius])
            else:
                raise ValueError(f"Unsupported shape type: {shape_type}")
            
            # Export to GLB format in memory
            glb_data = mesh.export(file_type='glb')
            
            # Convert to base64 string
            b64_glb = base64.b64encode(glb_data).decode('utf-8')
            
            return {
                "success": True,
                "shape": shape_type,
                "glb_base64": b64_glb
            }
        except Exception as e:
            logger.error(f"Error generating 3D model: {e}")
            return {"success": False, "error": str(e)}

generative_3d_service = Generative3DService()
