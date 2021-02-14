package com.nitika.ecommerce.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.metamodel.EntityType;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import com.nitika.ecommerce.entity.Country;
import com.nitika.ecommerce.entity.Product;
import com.nitika.ecommerce.entity.ProductCategory;
import com.nitika.ecommerce.entity.State;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer{
	
	@Value("${allowed.origins}")
	private String[] allowedOrigins;
	
	private EntityManager entityManager;
	
	public MyDataRestConfig(EntityManager theEntityManager) {
		entityManager= theEntityManager;
	}

	@Override
	public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {

		HttpMethod[] unsupportedActions = {HttpMethod.POST,HttpMethod.PUT,
											HttpMethod.DELETE, HttpMethod.PATCH};
		
		//disable unsupportedActions for Product Class
		config.getExposureConfiguration()
				.forDomainType(Product.class)
				.withItemExposure((metadata,httpMethods)-> httpMethods.disable(unsupportedActions))
				.withCollectionExposure((metadata,httpMethods)-> httpMethods.disable(unsupportedActions));

		//disable unsupportedActions for Product Class
		disableHttpMethods(Product.class, config, unsupportedActions);
		
		//disable unsupportedActions for ProductCategory Class
		disableHttpMethods(ProductCategory.class, config, unsupportedActions);

		//disable unsupportedActions for Country Class
		disableHttpMethods(Country.class, config, unsupportedActions);

		//disable unsupportedActions for State Class
		disableHttpMethods(State.class, config, unsupportedActions);
		
		// call internal helper method to expose product-category id
		exposeIds(config);
		
		// configure cors mapping
		cors.addMapping( config.getBasePath()+"/**").allowedOrigins(allowedOrigins);
	
	}

	private void disableHttpMethods(Class theClass, RepositoryRestConfiguration config, HttpMethod[] unsupportedActions) {
		config.getExposureConfiguration()
		.forDomainType(theClass)
		.withItemExposure((metadata,httpMethods)-> httpMethods.disable(unsupportedActions))
		.withCollectionExposure((metadata,httpMethods)-> httpMethods.disable(unsupportedActions));
	}

	private void exposeIds(RepositoryRestConfiguration config) {
		// expose entity ids
		
		// get a list of entity classes from entity manager
		Set<EntityType<?>> entities= entityManager.getMetamodel().getEntities();
		
		// create an array of entity classes
		List<Class> entityClasses= new ArrayList<>();
		
		// get the entity types for the entities
		for(EntityType tempEntityType: entities) {
			entityClasses.add(tempEntityType.getJavaType());
		}
		
		// expose the entity ids for array of entity/domain types
		Class[] domainTypes= entityClasses.toArray(new Class[0]);
		config.exposeIdsFor(domainTypes);
		
	}
	
	
}
