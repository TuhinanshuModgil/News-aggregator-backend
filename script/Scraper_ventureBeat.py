#!/usr/bin/env python
# coding: utf-8

# In[1]:


import requests


# In[2]:


from bs4 import BeautifulSoup


# In[3]:


topics_url = 'https://venturebeat.com/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}


# In[4]:


response = requests.get(topics_url, headers=headers)


# In[5]:


response.status_code


# In[6]:


len(response.text)


# In[7]:


page_contents = response.text


# In[8]:


page_contents[:1000]


# In[9]:


with open('webpage.html', 'w') as f:
    f.write(page_contents)


# In[10]:


doc = BeautifulSoup(page_contents, 'html.parser')


# In[11]:


selection_class ='dropdown-parent-link'
topic_titles = doc.find_all('a' , {'class': selection_class} )


# In[12]:


len(topic_titles)


# In[13]:


topic_titles


# In[14]:


topic_titles_final = []
# for tag in topic_titles: 
#     topic_titles_final.append(tag.text.strip())


# In[15]:


for li in doc.find_all('li'):
    # Check if the li contains a direct <a> tag and its next sibling is a <ul> tag
  if li.find('a') and li.find('ul', class_='nested-cats'):
    main_category = li.find('a').text.strip()  # Extract and clean text
    if main_category not in topic_titles_final:
       topic_titles_final.append(main_category)
print(topic_titles_final)


# In[16]:


len(topic_titles_final)


# In[17]:


topic_title_tag0 = topic_titles[0]


# In[18]:


from urllib.parse import urljoin

# Define base URL
base_url = 'https://venturebeat.com/'

# Lists for categories and URLs
title = []
topic_urls = []

# Extract categories
for li in doc.find_all('li'):
    if li.find('a') and li.find('ul', class_='nested-cats'):
        main_category = li.find('a').text.strip()  # Extract and clean text
        if main_category not in title:
            title.append(main_category)

# Extract URLs
for li in doc.find_all('li'):
    if li.find('a') and li.find('ul', class_='nested-cats'):
        href = li.find('a')['href'].strip()  # Extract and clean href attribute
        if href not in topic_urls:
            topic_urls.append(href)

# Use urljoin to form complete URLs
full_urls = [urljoin(base_url, url.lstrip('/')) for url in topic_urls]

# Ensure lists are of the same length
min_length = min(len(title), len(full_urls))
categories = title[:min_length]
full_urls = full_urls[:min_length]

# Create a dictionary
topics_dict = {
    'title': title,
    'url': full_urls
}



# In[19]:


topics_dict


# In[20]:


print(full_urls)


# In[21]:


import pandas as pd
topics_list = [(title, full_urls) for title, full_urls in topics_dict.items()]

# Create DataFrame
topics_df = pd.DataFrame(topics_list, columns=['title', 'url'])

# Print the DataFrame
print(topics_df)


# In[22]:


topic_repos_dict = {
    'articleName': [],
    'repo_url': [],
    'date': [],
    'text': []
}
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

# Loop through each topic URL
for topic_url in full_urls:
    response = requests.get(topic_url, headers=headers)
    
    if response.status_code != 200:
        print(f"Failed to retrieve {topic_url}")
        continue
    
    topic_doc = BeautifulSoup(response.text, 'html.parser')
    h2_selection_class = 'ArticleListing__title'
    repo_tags = topic_doc.find_all('h2', {'class': h2_selection_class})
    
    # Function to extract repo info
    def get_repo_info(h2_tag):
        a_tag = h2_tag.find('a')
        if not a_tag:
            return None, None
        username = a_tag.text.strip()
        repo_url = a_tag['href']
        return username, repo_url

    # Process each repo/article (limited to first 5 articles for each topic)
    for j in range(min(len(repo_tags), 5)):
        repo_info = get_repo_info(repo_tags[j])
        if not repo_info[1]:  # Skip if repo_url is None
            continue
        
        topic_repos_dict['articleName'].append(repo_info[0])
        topic_repos_dict['repo_url'].append(repo_info[1])

        # Fetch the article page
        article_url = repo_info[1]
        article_response = requests.get(article_url, headers=headers)
        
        if article_response.status_code != 200:
            print(f"Failed to retrieve article: {article_url}")
            continue
        
        article_doc = BeautifulSoup(article_response.text, 'html.parser')
        
        # Extract article text
        p_selection_class = 'border-top clearfix article-wrapper'
        article_tags = article_doc.find_all('article', {'class': p_selection_class})
        article_text = ' '.join(tag.get_text(strip=True) for tag in article_tags)
        # article_text = article_tags.get_text(strip=True)
        # Extract article date
        time_tags = article_doc.find_all('time')
        article_date = time_tags[0].text.strip() if time_tags else "No date found"
        
        # Append the article info
        topic_repos_dict['date'].append(article_date)
        topic_repos_dict['text'].append(article_text)



# In[23]:


import pandas as pd

# Combine dictionaries into a single dataframe
final_dict = {
    'topic_title': [],
    'article_title': [],
    'article_url': [],
    'article_date': [],
    'article_text': []
}

# Define number of articles per topic dynamically
articles_per_topic = 5
num_topics = len(topics_dict['title'])

# Ensure the topic_repos_dict contains enough data
total_articles = len(topic_repos_dict['articleName'])

# Iterate over topics
for i in range(num_topics):
    topic_title_draft = topics_dict['title'][i]
    
    start_index = i * articles_per_topic
    end_index = min(start_index + articles_per_topic, total_articles)  # Ensure no out-of-range access
    
    # Check if there are fewer articles for this topic
    if start_index >= total_articles:
        break  # If starting index exceeds total articles, break the loop
    
    # Loop through articles for the current topic
    for j in range(start_index, end_index):
        # Safeguard for missing or incomplete data
        if j < total_articles:
            final_dict['topic_title'].append(topic_title_draft)
            final_dict['article_title'].append(topic_repos_dict['articleName'][j])
            final_dict['article_url'].append(topic_repos_dict['repo_url'][j])
            final_dict['article_date'].append(topic_repos_dict['date'][j])
            final_dict['article_text'].append(topic_repos_dict['text'][j])

# Convert the final dictionary into a DataFrame
final_df = pd.DataFrame(final_dict)

# Export the dataframe to a CSV file
# final_df.to_csv('final_articles_ventureBeat.csv', index=False)
final_df.to_json('final_articles_ventureBeat.json', orient='records')
print("CSV file created successfully!")


# In[ ]:




