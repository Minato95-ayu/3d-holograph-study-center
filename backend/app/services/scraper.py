import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict

logger = logging.getLogger("studo-scraper")

class ResearchScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def search_scientific_data(self, query: str) -> List[Dict]:
        """Search for scientific papers and data snippets."""
        search_url = f"https://www.google.com/search?q={query}+research+paper+formula"
        try:
            response = requests.get(search_url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            # Basic parsing of search results
            for g in soup.find_all('div', class_='g')[:3]:
                anchor = g.find('a')
                if anchor:
                    link = anchor['href']
                    title = g.find('h3').text if g.find('h3') else 'Research Paper'
                    snippet = g.find('div', class_='VwiC3b').text if g.find('div', class_='VwiC3b') else ''
                    results.append({
                        "title": title,
                        "url": link,
                        "snippet": snippet
                    })
            return results
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return []

    async def find_3d_assets(self, query: str) -> List[str]:
        """Look for potential 3D model references."""
        search_url = f"https://www.google.com/search?q={query}+3d+model+gltf+sketchfab"
        try:
            response = requests.get(search_url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if 'sketchfab.com/3d-models/' in href:
                    links.append(href)
            return list(set(links))[:5]
        except Exception as e:
            logger.error(f"3D search error: {e}")
            return []

research_scraper = ResearchScraper()
